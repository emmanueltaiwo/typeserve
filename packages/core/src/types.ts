export type ArrayCount = 1 | 2 | 3 | 4 | 5;

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  type: string;
  file?: string;
  count?: ArrayCount;
}

export interface TypeServeConfig {
  routes: RouteConfig[];
  port?: number;
  basePath?: string;
}

export interface ParsedType {
  name: string;
  properties: Record<string, TypeProperty>;
  isArray: boolean;
  isEnum: boolean;
  enumValues?: string[];
}

export interface TypeProperty {
  type: string;
  isOptional: boolean;
  isArray: boolean;
  isEnum: boolean;
  enumValues?: string[];
  nestedType?: ParsedType;
}
