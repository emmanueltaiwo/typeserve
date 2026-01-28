import { Project } from 'ts-morph';
import { CreateServerRequest, CreateRouteRequest } from '../types';
import { tmpdir } from 'os';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export class ValidationService {
  static validateExpressPath(path: string): { valid: boolean; error?: string } {
    if (!path.startsWith('/')) {
      return {
        valid: false,
        error: `Path must start with '/': ${path}`,
      };
    }

    const invalidChars = /[^a-zA-Z0-9\/\-_:\*\(\)\?\+\.\[\]]/;
    if (invalidChars.test(path)) {
      return {
        valid: false,
        error: `Path contains invalid characters: ${path}. Only letters, numbers, /, -, _, :, *, (, ), ?, +, ., [, ] are allowed.`,
      };
    }

    // Check for consecutive slashes (except at start)
    if (path.match(/\/{2,}/) && path !== '//') {
      return {
        valid: false,
        error: `Path cannot contain consecutive slashes: ${path}`,
      };
    }

    if (path.includes('::')) {
      return {
        valid: false,
        error: `Path contains invalid parameter syntax (double colon): ${path}. Use /:paramName format.`,
      };
    }

    // Check for parameter without name
    const paramMatch = path.match(/\/:[^\/]*/g);
    if (paramMatch) {
      for (const param of paramMatch) {
        if (param === '/:' || param.length === 2) {
          return {
            valid: false,
            error: `Path parameter must have a name: ${path}. Use /:paramName format.`,
          };
        }
      }
    }

    return { valid: true };
  }

  static validateResponseType(responseType: string): {
    valid: boolean;
    error?: string;
  } {
    if (!responseType || responseType.trim().length === 0) {
      return {
        valid: false,
        error: 'Response type cannot be empty',
      };
    }

    // Check if it's an array type (ends with [])
    const isArray = responseType.endsWith('[]');
    const baseType = isArray
      ? responseType.slice(0, -2).trim()
      : responseType.trim();

    if (baseType.length === 0) {
      return {
        valid: false,
        error: 'Response type cannot be empty (invalid array syntax)',
      };
    }

    const validIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!validIdentifier.test(baseType)) {
      return {
        valid: false,
        error: `Invalid response type format: "${responseType}". Type names must start with a letter or underscore and contain only letters, numbers, and underscores.`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate TypeScript types code and check if referenced types exist
   */
  static async validateTypesCode(
    typesCode: string,
    routes: CreateRouteRequest[]
  ): Promise<{ valid: boolean; error?: string; missingTypes?: string[] }> {
    if (!typesCode || typesCode.trim().length === 0) {
      return {
        valid: false,
        error: 'TypeScript types code cannot be empty',
      };
    }

    const tempDir = join(tmpdir(), 'typeserve-validation', randomUUID());
    const typesFile = join(tempDir, 'types.ts');

    try {
      // Ensure temp directory exists
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      // Write types to temporary file
      writeFileSync(typesFile, typesCode, 'utf-8');

      // Try to parse with ts-morph
      // Configure project to skip lib checks and only validate the user's file
      const project = new Project({
        tsConfigFilePath: undefined,
        skipAddingFilesFromTsConfig: true,
        skipFileDependencyResolution: true,
        skipLoadingLibFiles: true,
        compilerOptions: {
          target: 99,
          module: 99,
          lib: [],
          skipLibCheck: true,
          noLib: true,
        },
      });

      const sourceFile = project.addSourceFileAtPath(typesFile);

      // Security: Check for dangerous code patterns
      const sourceText = sourceFile.getFullText();

      // Block require() calls (security risk - could execute code)
      if (sourceText.includes('require(')) {
        return {
          valid: false,
          error:
            'Types code cannot contain require() calls. Only type definitions (interfaces, types, enums) are allowed.',
        };
      }

      const functionPattern =
        /(?:^|\n)\s*(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|async\s*\(|function\s*\())/m;
      if (functionPattern.test(sourceText)) {
        return {
          valid: false,
          error:
            'Types code cannot contain function declarations. Only type definitions (interfaces, types, enums) are allowed.',
        };
      }

      if (sourceText.match(/(?:^|\n)\s*class\s+\w+/m)) {
        return {
          valid: false,
          error:
            'Types code cannot contain class declarations. Only type definitions (interfaces, types, enums) are allowed.',
        };
      }

      // Check for syntax errors (only in user's types file, ignore node_modules and lib errors)
      const diagnostics = project.getPreEmitDiagnostics();
      const normalizedTypesFile = typesFile.replace(/\\/g, '/');

      const userFileErrors = diagnostics
        .filter((d) => {
          if (d.getCategory() !== 1) {
            return false;
          }

          const file = d.getSourceFile();
          if (!file) {
            return false;
          }

          const filePath = file.getFilePath().replace(/\\/g, '/');

          if (filePath !== normalizedTypesFile) {
            return false;
          }

          return true;
        })
        .map((e) => {
          const message = e.getMessageText();
          const line = e.getLineNumber();
          return `Line ${line}: ${typeof message === 'string' ? message : message.getMessageText()}`;
        });

      if (userFileErrors.length > 0) {
        return {
          valid: false,
          error: `TypeScript syntax errors in types code: ${userFileErrors.join('; ')}`,
        };
      }

      // Extract all defined type names (interfaces, types, enums)
      const definedTypes = new Set<string>();

      // Get interfaces
      sourceFile.getInterfaces().forEach((intf) => {
        definedTypes.add(intf.getName());
      });

      sourceFile.getTypeAliases().forEach((typeAlias) => {
        definedTypes.add(typeAlias.getName());
      });

      // Get enums
      sourceFile.getEnums().forEach((enumDecl) => {
        definedTypes.add(enumDecl.getName());
      });

      if (definedTypes.size === 0) {
        return {
          valid: false,
          error:
            'No types, interfaces, or enums found in the types code. Please define at least one type.',
        };
      }

      const missingTypes: string[] = [];

      for (const route of routes) {
        const responseType = route.responseType.trim();
        const isArray = responseType.endsWith('[]');
        const baseType = isArray
          ? responseType.slice(0, -2).trim()
          : responseType.trim();

        if (!definedTypes.has(baseType)) {
          missingTypes.push(
            `Route ${route.method} ${route.path}: type "${baseType}" not found in types code`
          );
        }
      }

      if (missingTypes.length > 0) {
        return {
          valid: false,
          error: `The following types referenced in routes are not defined in your types code:\n${missingTypes.join('\n')}`,
          missingTypes: missingTypes,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Failed to parse TypeScript types: ${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      // Clean up temp directory
      if (existsSync(tempDir)) {
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error(
            `[ValidationService] Error cleaning up temp dir: ${cleanupError}`
          );
        }
      }
    }
  }

  static async validateServerRequest(
    request: CreateServerRequest
  ): Promise<{ valid: boolean; error?: string }> {
    // Check for duplicate routes (same method and path)
    const routeKeys = new Set<string>();
    for (let i = 0; i < request.routes.length; i++) {
      const route = request.routes[i];
      if (!route) {
        return {
          valid: false,
          error: `Route at index ${i} is undefined or invalid`,
        };
      }
      const routeKey = `${route.method}:${route.path}`;

      if (routeKeys.has(routeKey)) {
        return {
          valid: false,
          error: `Duplicate route found: ${route.method} ${route.path}. Each route must have a unique combination of method and path.`,
        };
      }
      routeKeys.add(routeKey);
    }

    // Validate routes
    for (let i = 0; i < request.routes.length; i++) {
      const route = request.routes[i];
      if (!route) {
        return {
          valid: false,
          error: `Route at index ${i} is undefined or invalid`,
        };
      }

      const routeMethod = route.method;
      const routePath = route.path;
      const routeResponseType = route.responseType;

      const pathValidation = this.validateExpressPath(routePath);
      if (!pathValidation.valid) {
        return {
          valid: false,
          error: `Route ${i + 1} (${routeMethod} ${routePath}): ${pathValidation.error}`,
        };
      }

      // Validate responseType format
      const typeValidation = this.validateResponseType(routeResponseType);
      if (!typeValidation.valid) {
        return {
          valid: false,
          error: `Route ${i + 1} (${routeMethod} ${routePath}): ${typeValidation.error}`,
        };
      }
    }

    const typesValidation = await this.validateTypesCode(
      request.types,
      request.routes
    );
    if (!typesValidation.valid) {
      return {
        valid: false,
        error: typesValidation.error || 'Types validation failed',
      };
    }

    return { valid: true };
  }
}
