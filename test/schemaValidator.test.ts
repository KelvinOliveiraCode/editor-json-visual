import { describe, expect, it } from "vitest";
import { validate } from "../src/schemaValidator";
import type { JsonSchema } from "../src/types";

describe("validate — tipos primitivos", () => {
  it("aceita string quando schema diz string", () => {
    const result = validate("olá", { type: "string" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejeita número quando schema diz string", () => {
    const result = validate(42, { type: "string" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("esperado tipo");
    expect(result.errors[0].schemaPath).toBe(".type");
  });

  it("aceita número inteiro", () => {
    const result = validate(7, { type: "integer" });
    expect(result.valid).toBe(true);
  });

  it("rejeita não-inteiro para integer", () => {
    const result = validate(3.5, { type: "integer" });
    expect(result.valid).toBe(false);
  });

  it("aceita booleano", () => {
    expect(validate(true, { type: "boolean" }).valid).toBe(true);
    expect(validate(false, { type: "boolean" }).valid).toBe(true);
  });

  it("aceita null", () => {
    expect(validate(null, { type: "null" }).valid).toBe(true);
  });

  it("rejeita null para string", () => {
    const result = validate(null, { type: "string" });
    expect(result.valid).toBe(false);
  });

  it("schema vazio aceita qualquer valor", () => {
    expect(validate(42, {}).valid).toBe(true);
    expect(validate("x", {}).valid).toBe(true);
    expect(validate(null, {}).valid).toBe(true);
    expect(validate([1, 2], {}).valid).toBe(true);
  });
});

describe("validate — enum e const", () => {
  it("aceita valor presente no enum", () => {
    expect(validate("a", { enum: ["a", "b"] }).valid).toBe(true);
  });

  it("rejeita valor ausente do enum", () => {
    const result = validate("c", { enum: ["a", "b"] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".enum");
  });

  it("aceita valor igual ao const", () => {
    expect(validate(5, { const: 5 }).valid).toBe(true);
  });

  it("rejeita valor diferente do const", () => {
    const result = validate(6, { const: 5 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".const");
  });
});

describe("validate — restrições numéricas", () => {
  const schema: JsonSchema = { type: "number", minimum: 0, maximum: 100 };

  it("aceita dentro do intervalo", () => {
    expect(validate(50, schema).valid).toBe(true);
  });

  it("aceita nos limites mínimo e máximo", () => {
    expect(validate(0, schema).valid).toBe(true);
    expect(validate(100, schema).valid).toBe(true);
  });

  it("rejeita abaixo do mínimo", () => {
    const result = validate(-1, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".minimum");
  });

  it("rejeita acima do máximo", () => {
    const result = validate(101, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".maximum");
  });

  it("exclusiveMinimum rejeita valor igual ao limite", () => {
    const result = validate(0, {
      type: "number",
      exclusiveMinimum: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".exclusiveMinimum");
  });

  it("exclusiveMaximum rejeita valor igual ao limite", () => {
    const result = validate(100, {
      type: "number",
      exclusiveMaximum: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".exclusiveMaximum");
  });
});

describe("validate — restrições de string", () => {
  it("minLength aceita tamanho suficiente", () => {
    expect(validate("abc", { type: "string", minLength: 3 }).valid).toBe(true);
  });

  it("minLength rejeita tamanho insuficiente", () => {
    const result = validate("ab", { type: "string", minLength: 3 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".minLength");
  });

  it("maxLength rejeita tamanho excessivo", () => {
    const result = validate("abcd", { type: "string", maxLength: 3 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".maxLength");
  });

  it("pattern aceita padrão correspondente", () => {
    expect(
      validate("ABC123", { type: "string", pattern: "^[A-Z]+[0-9]+$" }).valid,
    ).toBe(true);
  });

  it("pattern rejeita padrão não correspondente", () => {
    const result = validate("abc", { type: "string", pattern: "^[0-9]+$" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".pattern");
  });
});

describe("validate — objetos", () => {
  const schema: JsonSchema = {
    type: "object",
    required: ["nome", "idade"],
    properties: {
      nome: { type: "string" },
      idade: { type: "integer", minimum: 0 },
    },
    additionalProperties: false,
  };

  it("aceita objeto válido", () => {
    expect(
      validate({ nome: "Ada", idade: 36 }, schema).valid,
    ).toBe(true);
  });

  it("rejeita propriedade obrigatória ausente", () => {
    const result = validate({ nome: "Ada" }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("idade"))).toBe(true);
    expect(result.errors[0].path).toBe(".idade");
  });

  it("rejeita tipo errado em propriedade", () => {
    const result = validate({ nome: "Ada", idade: "trinta" }, schema);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.path === ".idade"),
    ).toBe(true);
  });

  it("rejeita propriedade adicional não permitida", () => {
    const result = validate({ nome: "Ada", idade: 36, extra: 1 }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".additionalProperties");
  });

  it("minProperties e maxProperties", () => {
    const result = validate({ a: 1, b: 2, c: 3 }, {
      type: "object",
      maxProperties: 2,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".maxProperties");
  });
});

describe("validate — arrays", () => {
  it("aceita array com itens válidos", () => {
    expect(
      validate([1, 2, 3], { type: "array", items: { type: "integer" } }).valid,
    ).toBe(true);
  });

  it("rejeita array com item inválido", () => {
    const result = validate([1, "x", 3], {
      type: "array",
      items: { type: "integer" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("[1]");
  });

  it("minItems e maxItems", () => {
    const result = validate([1, 2, 3], { type: "array", maxItems: 2 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].schemaPath).toBe(".maxItems");
  });

  it("tuple de itens valida posições", () => {
    const result = validate(["a", 1], {
      type: "array",
      items: [{ type: "string" }, { type: "number" }],
    });
    expect(result.valid).toBe(true);
  });
});

describe("validate — aninhamento e múltiplos erros", () => {
  it("reporta erro com caminho aninhado", () => {
    const result = validate(
      { usuario: { nome: 123 } },
      {
        type: "object",
        properties: {
          usuario: {
            type: "object",
            properties: { nome: { type: "string" } },
          },
        },
      },
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe(".usuario.nome");
  });

  it("acumula vários erros em vez de parar no primeiro", () => {
    const result = validate(
      { nome: 1, idade: "x" },
      {
        type: "object",
        required: ["nome", "idade", "email"],
        properties: {
          nome: { type: "string" },
          idade: { type: "integer" },
        },
      },
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
