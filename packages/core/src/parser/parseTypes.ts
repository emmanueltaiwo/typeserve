import {
  Project,
  SourceFile,
  Type,
  TypeAliasDeclaration,
  InterfaceDeclaration,
  EnumDeclaration,
} from 'ts-morph';
import { join, resolve } from 'path';
import { ParsedType, TypeProperty, TypeServeConfig } from '../types';

let project: Project | null = null;
const parsedTypeCache = new Map<string, ParsedType>();
const sourceFilesCache = new Map<string, SourceFile[]>();

function getProject(): Project {
  if (!project) {
    project = new Project({
      tsConfigFilePath: undefined,
      skipAddingFilesFromTsConfig: true,
    });
  }
  return project;
}

export function resetParser(): void {
  project = null;
  parsedTypeCache.clear();
  sourceFilesCache.clear();
}

function getCacheKey(
  projectRoot: string,
  typeName: string,
  filePath?: string,
): string {
  return `${projectRoot}:${filePath || 'all'}:${typeName}`;
}

function getSourceFiles(projectRoot: string, filePath?: string): SourceFile[] {
  const cacheKey = `${projectRoot}:${filePath || 'all'}`;
  const cached = sourceFilesCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const proj = getProject();
  const sourceFiles = filePath
    ? [proj.addSourceFileAtPath(resolve(projectRoot, filePath))]
    : proj.addSourceFilesAtPaths([
        join(projectRoot, '**/*.ts'),
        join(projectRoot, '**/*.tsx'),
      ]);

  sourceFilesCache.set(cacheKey, sourceFiles);
  return sourceFiles;
}

export function getTypeFilePaths(
  projectRoot: string,
  config: TypeServeConfig,
): Set<string> {
  const filePaths = new Set<string>();

  for (const route of config.routes) {
    const isArray = route.type.endsWith('[]');
    const actualTypeName = isArray ? route.type.slice(0, -2) : route.type;

    if (route.file) {
      filePaths.add(resolve(projectRoot, route.file));
    } else {
      const sourceFiles = getSourceFiles(projectRoot);
      for (const sourceFile of sourceFiles) {
        const typeAlias = sourceFile.getTypeAlias(actualTypeName);
        const interfaceDecl = sourceFile.getInterface(actualTypeName);
        const enumDecl = sourceFile.getEnum(actualTypeName);

        if (typeAlias || interfaceDecl || enumDecl) {
          const filePath = sourceFile.getFilePath();
          filePaths.add(filePath);
          break;
        }
      }
    }
  }

  return filePaths;
}

export function parseTypes(
  projectRoot: string,
  typeName: string,
  filePath?: string,
): ParsedType {
  const cacheKey = getCacheKey(projectRoot, typeName, filePath);
  const cached = parsedTypeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const isArray = typeName.endsWith('[]');
  const actualTypeName = isArray ? typeName.slice(0, -2) : typeName;

  const sourceFiles = getSourceFiles(projectRoot, filePath);

  let foundType:
    | TypeAliasDeclaration
    | InterfaceDeclaration
    | EnumDeclaration
    | null = null;

  for (const sourceFile of sourceFiles) {
    const typeAlias = sourceFile.getTypeAlias(actualTypeName);
    const interfaceDecl = sourceFile.getInterface(actualTypeName);
    const enumDecl = sourceFile.getEnum(actualTypeName);

    if (typeAlias) {
      foundType = typeAlias;
      break;
    }
    if (interfaceDecl) {
      foundType = interfaceDecl;
      break;
    }
    if (enumDecl) {
      foundType = enumDecl;
      break;
    }
  }

  if (!foundType) {
    throw new Error(
      `Type "${actualTypeName}" not found${filePath ? ` in ${filePath}` : ''}`,
    );
  }

  if (foundType instanceof EnumDeclaration) {
    const parsed = parseEnum(foundType);
    const result = { ...parsed, isArray };
    parsedTypeCache.set(cacheKey, result);
    return result;
  }

  const proj = getProject();
  const type = proj.getTypeChecker().getTypeAtLocation(foundType);
  const parsed = parseTypeNode(type, actualTypeName, projectRoot);
  const result = { ...parsed, isArray };
  parsedTypeCache.set(cacheKey, result);
  return result;
}

function parseEnum(enumDecl: EnumDeclaration): ParsedType {
  const enumValues = enumDecl.getMembers().map((m) => {
    const initializer = m.getValue();
    if (initializer !== undefined) {
      return String(initializer);
    }
    return m.getName();
  });
  return {
    name: enumDecl.getName(),
    properties: {},
    isArray: false,
    isEnum: true,
    enumValues,
  };
}

function parseTypeNode(
  type: Type,
  name: string,
  projectRoot?: string,
  visited: Set<string> = new Set(),
): ParsedType {
  const isArray = type.isArray();
  const arrayElementType = isArray ? type.getArrayElementType() : null;
  const targetType = arrayElementType || type;

  if (targetType.isStringLiteral() || targetType.isNumberLiteral()) {
    return {
      name,
      properties: {},
      isArray,
      isEnum: true,
      enumValues: [targetType.getLiteralValue()?.toString() || ''],
    };
  }

  const properties: Record<string, TypeProperty> = {};
  const propertiesMap = targetType.getProperties();

  for (const prop of propertiesMap) {
    const propName = prop.getName();
    const propType = prop.getValueDeclaration()
      ? targetType
          .getProperty(propName)
          ?.getTypeAtLocation(prop.getValueDeclaration()!)
      : null;

    if (!propType) continue;

    const declaration = prop.getValueDeclaration();
    const isOptional =
      (declaration && (declaration as any).hasQuestionToken?.()) || false;
    const propIsArray = propType.isArray();
    const arrayElementType = propType.getArrayElementType();
    const propElementType =
      propIsArray && arrayElementType ? arrayElementType : propType;

    const typeString = propElementType.getText();
    const isEnum =
      propElementType.isUnion() &&
      propElementType
        .getUnionTypes()
        .every((t) => t.isStringLiteral() || t.isNumberLiteral());

    let enumValues: string[] | undefined;
    if (isEnum) {
      enumValues = propElementType.getUnionTypes().map((t) => {
        const literal = t.getLiteralValue();
        return literal?.toString() || '';
      });
    }

    let nestedType: ParsedType | undefined;
    const symbol = propElementType.getSymbol();
    if (symbol && projectRoot) {
      const typeName = symbol.getName();
      const isPrimitive = [
        'String',
        'Number',
        'Boolean',
        'Date',
        'Object',
        'Array',
        'Function',
        'RegExp',
        'Error',
      ].includes(typeName);
      const isGeneric =
        typeName.includes('<') ||
        typeName.includes('|') ||
        typeName.includes('&');

      if (
        typeName &&
        !isPrimitive &&
        !isGeneric &&
        !typeName.includes('[]') &&
        !visited.has(typeName)
      ) {
        try {
          visited.add(typeName);
          const declaration = symbol.getValueDeclaration();
          let nestedFilePath: string | undefined;
          if (declaration) {
            const sourceFile = declaration.getSourceFile();
            if (sourceFile) {
              nestedFilePath = sourceFile.getFilePath();
            }
          }
          nestedType = parseTypes(projectRoot, typeName, nestedFilePath);
          visited.delete(typeName);
        } catch {
          visited.delete(typeName);
        }
      }
    }

    properties[propName] = {
      type: typeString,
      isOptional,
      isArray: propIsArray,
      isEnum,
      enumValues,
      nestedType,
    };
  }

  return {
    name,
    properties,
    isArray,
    isEnum: false,
  };
}
