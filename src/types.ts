export type JsonSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JsonSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type?: JsonSchemaType | JsonSchemaType[];
  enum?: unknown[];
  const?: unknown;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  items?: JsonSchema | JsonSchema[];
  required?: string[];
  properties?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
  minProperties?: number;
  maxProperties?: number;
}

export interface ValidationError {
  path: string;
  message: string;
  schemaPath: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface EditorState {
  jsonText: string;
  schemaText: string;
  parsedJson: unknown | null;
  parseJsonError: string | null;
  parsedSchema: JsonSchema | null;
  parseSchemaError: string | null;
  validation: ValidationResult | null;
  validating: boolean;
}
