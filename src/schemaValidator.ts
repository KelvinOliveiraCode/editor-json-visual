import type { JsonSchema, JsonSchemaType, ValidationError, ValidationResult } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isType(value: unknown, type: JsonSchemaType): boolean {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return isObject(value);
    case "array":
      return Array.isArray(value);
    case "null":
      return value === null;
    default:
      return false;
  }
}

function matchTypes(value: unknown, types: JsonSchemaType[]): boolean {
  return types.some((type) => isType(value, type));
}

function check(
  instance: unknown,
  schema: JsonSchema,
  path: string,
  schemaPath: string,
  errors: ValidationError[],
): void {
  // --- type ---------------------------------------------------------------
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!matchTypes(instance, types)) {
      errors.push({
        path,
        message: `esperado tipo ${types.join(" / ")}`,
        schemaPath: `${schemaPath}.type`,
      });
      return; // tipo incorreto: não vale a pena validar palavras-chave restantes
    }
  }

  // --- enum ---------------------------------------------------------------
  if (schema.enum !== undefined && !schema.enum.includes(instance)) {
    errors.push({
      path,
      message: "valor não pertence ao enum",
      schemaPath: `${schemaPath}.enum`,
    });
  }

  // --- const --------------------------------------------------------------
  if (schema.const !== undefined && instance !== schema.const) {
    errors.push({
      path,
      message: `valor diferente de ${JSON.stringify(schema.const)}`,
      schemaPath: `${schemaPath}.const`,
    });
  }

  // --- restrições numéricas -----------------------------------------------
  if (typeof instance === "number" && Number.isFinite(instance)) {
    if (schema.minimum !== undefined && instance < schema.minimum) {
      errors.push({
        path,
        message: `deve ser >= ${schema.minimum}`,
        schemaPath: `${schemaPath}.minimum`,
      });
    }
    if (schema.maximum !== undefined && instance > schema.maximum) {
      errors.push({
        path,
        message: `deve ser <= ${schema.maximum}`,
        schemaPath: `${schemaPath}.maximum`,
      });
    }
    if (
      schema.exclusiveMinimum !== undefined &&
      instance <= schema.exclusiveMinimum
    ) {
      errors.push({
        path,
        message: `deve ser > ${schema.exclusiveMinimum}`,
        schemaPath: `${schemaPath}.exclusiveMinimum`,
      });
    }
    if (
      schema.exclusiveMaximum !== undefined &&
      instance >= schema.exclusiveMaximum
    ) {
      errors.push({
        path,
        message: `deve ser < ${schema.exclusiveMaximum}`,
        schemaPath: `${schemaPath}.exclusiveMaximum`,
      });
    }
  }

  // --- restrições de string -----------------------------------------------
  if (typeof instance === "string") {
    if (schema.minLength !== undefined && instance.length < schema.minLength) {
      errors.push({
        path,
        message: `comprimento mínimo ${schema.minLength}`,
        schemaPath: `${schemaPath}.minLength`,
      });
    }
    if (schema.maxLength !== undefined && instance.length > schema.maxLength) {
      errors.push({
        path,
        message: `comprimento máximo ${schema.maxLength}`,
        schemaPath: `${schemaPath}.maxLength`,
      });
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(instance)) {
      errors.push({
        path,
        message: `não casa com o padrão "${schema.pattern}"`,
        schemaPath: `${schemaPath}.pattern`,
      });
    }
  }

  // --- restrições de array ------------------------------------------------
  if (Array.isArray(instance)) {
    if (schema.minItems !== undefined && instance.length < schema.minItems) {
      errors.push({
        path,
        message: `mínimo ${schema.minItems} itens`,
        schemaPath: `${schemaPath}.minItems`,
      });
    }
    if (schema.maxItems !== undefined && instance.length > schema.maxItems) {
      errors.push({
        path,
        message: `máximo ${schema.maxItems} itens`,
        schemaPath: `${schemaPath}.maxItems`,
      });
    }
    if (schema.items !== undefined) {
      if (Array.isArray(schema.items)) {
        // tuple: valida cada posição com seu schema
        schema.items.forEach((itemSchema, idx) => {
          if (idx < instance.length) {
            check(
              instance[idx],
              itemSchema,
              `${path}[${idx}]`,
              `${schemaPath}.items[${idx}]`,
              errors,
            );
          }
        });
      } else {
        // schema único: se aplica a todos os elementos do array
        instance.forEach((item, idx) => {
          check(
            item,
            schema.items as JsonSchema,
            `${path}[${idx}]`,
            `${schemaPath}.items`,
            errors,
          );
        });
      }
    }
  }

  // --- restrições de objeto -----------------------------------------------
  if (isObject(instance)) {
    const keys = Object.keys(instance);

    if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
      errors.push({
        path,
        message: `mínimo ${schema.minProperties} propriedades`,
        schemaPath: `${schemaPath}.minProperties`,
      });
    }
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) {
      errors.push({
        path,
        message: `máximo ${schema.maxProperties} propriedades`,
        schemaPath: `${schemaPath}.maxProperties`,
      });
    }

    if (schema.required !== undefined) {
      schema.required.forEach((key) => {
        if (!(key in instance)) {
          errors.push({
            path: `${path}.${key}`,
            message: `propriedade obrigatória "${key}" ausente`,
            schemaPath: `${schemaPath}.required`,
          });
        }
      });
    }

    const definedProps = schema.properties ? Object.keys(schema.properties) : [];

    if (schema.properties !== undefined) {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        if (key in instance) {
          check(
            instance[key],
            subSchema,
            `${path}.${key}`,
            `${schemaPath}.properties.${key}`,
            errors,
          );
        }
      }
    }

    if (schema.additionalProperties !== undefined) {
      const additional = keys.filter((k) => !definedProps.includes(k));
      if (schema.additionalProperties === false && additional.length > 0) {
        errors.push({
          path,
          message: `propriedades adicionais não permitidas: ${additional.join(", ")}`,
          schemaPath: `${schemaPath}.additionalProperties`,
        });
      } else if (typeof schema.additionalProperties === "object") {
        additional.forEach((key) => {
          check(
            instance[key],
            schema.additionalProperties as JsonSchema,
            `${path}.${key}`,
            `${schemaPath}.additionalProperties`,
            errors,
          );
        });
      }
    }
  }
}

/**
 * Valida `instance` contra `schema` (subconjunto do JSON Schema).
 * Retorno: { valido: boolean, erros: Array<{caminho, mensagem, caminhoNoSchema}> }.
 */
export function validate(
  instance: unknown,
  schema: JsonSchema,
): ValidationResult {
  const errors: ValidationError[] = [];
  check(instance, schema, "", "", errors);
  return { valid: errors.length === 0, errors };
}
