import { useCallback, useMemo, useRef, useState } from "react";
import type { JsonSchema, ValidationResult } from "./types";
import { validate } from "./schemaValidator";

const EXEMPLO_JSON = JSON.stringify(
  {
    nome: "Ada Lovelace",
    idade: 36,
    ativo: true,
    tags: ["computacao", "algoritmo"],
    endereco: {
      rua: "Rua das Flores",
      numero: 42,
    },
  },
  null,
  2,
);

const EXEMPLO_SCHEMA = JSON.stringify(
  {
    type: "object",
    required: ["nome", "idade"],
    properties: {
      nome: { type: "string", minLength: 1 },
      idade: { type: "integer", minimum: 0 },
      ativo: { type: "boolean" },
      tags: { type: "array", items: { type: "string" } },
      endereco: {
        type: "object",
        properties: {
          rua: { type: "string" },
          numero: { type: "integer" },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  null,
  2,
);

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function renderNode(
  value: unknown,
  path: string,
  expanded: Set<string>,
  onToggle: (p: string) => void,
): JSX.Element {
  const key = path || "raiz";
  const isExpanded = expanded.has(key);

  if (value === null) {
    return (
      <div className="node node-null" data-path={path}>
        <span className="token">null</span>
      </div>
    );
  }
  if (Array.isArray(value)) {
    const items = value.map((item, idx) => (
      <div key={idx} className="node-item">
        <span className="index">[{idx}]</span>{" "}
        {renderNode(item, `${path}[${idx}]`, expanded, onToggle)}
      </div>
    ));
    return (
      <div className="node node-array" data-path={path}>
        <div className="node-header" onClick={() => onToggle(key)}>
          <span className="toggle">{isExpanded ? "▾" : "▸"}</span>
          <span className="type">array</span>{" "}
          <span className="size">({value.length})</span>
        </div>
        {isExpanded && <div className="node-children">{items}</div>}
      </div>
    );
  }
  if (isObject(value)) {
    const entries = Object.entries(value);
    const children = entries.map(([k, v]) => (
      <div key={k} className="node-item">
        <span className="key">"{k}"</span>:{" "}
        {renderNode(v, `${path}.${k}`, expanded, onToggle)}
      </div>
    ));
    return (
      <div className="node node-object" data-path={path}>
        <div className="node-header" onClick={() => onToggle(key)}>
          <span className="toggle">{isExpanded ? "▾" : "▸"}</span>
          <span className="type">object</span>{" "}
          <span className="size">({entries.length})</span>
        </div>
        {isExpanded && <div className="node-children">{children}</div>}
      </div>
    );
  }
  if (typeof value === "string") {
    return (
      <div className="node node-string" data-path={path}>
        <span className="token">"{value}"</span>
      </div>
    );
  }
  if (typeof value === "number") {
    return (
      <div className="node node-number" data-path={path}>
        <span className="token">{String(value)}</span>
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <div className="node node-boolean" data-path={path}>
        <span className="token">{String(value)}</span>
      </div>
    );
  }
  return (
    <div className="node node-unknown" data-path={path}>
      <span className="token">desconhecido</span>
    </div>
  );
}

export default function EditorJSONVisual(): JSX.Element {
  const [jsonText, setJsonText] = useState(EXEMPLO_JSON);
  const [schemaText, setSchemaText] = useState(EXEMPLO_SCHEMA);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["raiz"]));
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  const parseJsonRef = useRef<{ parsed: unknown | null; error: string | null }>({
    parsed: null,
    error: null,
  });
  const parseSchemaRef = useRef<{ parsed: JsonSchema | null; error: string | null }>({
    parsed: null,
    error: null,
  });

  const parseJson = useCallback((text: string): void => {
    try {
      parseJsonRef.current = { parsed: JSON.parse(text), error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      parseJsonRef.current = { parsed: null, error: message };
    }
  }, []);

  const parseSchema = useCallback((text: string): void => {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!isObject(parsed)) {
        throw new Error("schema deve ser um objeto JSON");
      }
      parseSchemaRef.current = { parsed: parsed as JsonSchema, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      parseSchemaRef.current = { parsed: null, error: message };
    }
  }, []);

  const handleJsonChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      const text = event.target.value;
      setJsonText(text);
      parseJson(text);
    },
    [],
  );

  const handleSchemaChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      const text = event.target.value;
      setSchemaText(text);
      parseSchema(text);
    },
    [],
  );

  const runValidation = useCallback((): void => {
    const { parsed: json, error: jsonError } = parseJsonRef.current;
    const { parsed: schema, error: schemaError } = parseSchemaRef.current;

    if (jsonError || schemaError || json === null || schema === null) {
      setValidation(null);
      setValidating(false);
      return;
    }

    setValidating(true);
    // validação síncrona pura; o setValidating(false) fecha o ciclo
    const result = validate(json, schema);
    setValidation(result);
    setValidating(false);
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleValidate = useCallback((): void => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      runValidation();
      debounceRef.current = null;
    }, 150);
  }, [runValidation]);

  useMemo(() => {
    handleValidate();
  }, [jsonText, schemaText, handleValidate]);

  const toggleNode = useCallback((path: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const jsonError = parseJsonRef.current.error;
  const schemaError = parseSchemaRef.current.error;

  return (
    <section className="editor">
      <div className="toolbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleValidate}
          disabled={validating || !!jsonError || !!schemaError}
        >
          {validating ? "Validando…" : "Validar JSON"}
        </button>
        {jsonError && (
          <span className="badge badge-error">JSON inválido: {jsonError}</span>
        )}
        {schemaError && (
          <span className="badge badge-error">Schema inválido: {schemaError}</span>
        )}
      </div>

      <div className="panes">
        <div className="pane">
          <label>JSON</label>
          <textarea
            value={jsonText}
            onChange={handleJsonChange}
            spellCheck={false}
            aria-label="Conteúdo JSON"
          />
        </div>
        <div className="pane">
          <label>Schema JSON</label>
          <textarea
            value={schemaText}
            onChange={handleSchemaChange}
            spellCheck={false}
            aria-label="Schema JSON"
          />
        </div>
      </div>

      <div className="visual">
        <h3>Visualização</h3>
        <div className="tree">
          {parseJsonRef.current.parsed === null ? (
            <p className="empty">Aguardando JSON válido…</p>
          ) : (
            renderNode(
              parseJsonRef.current.parsed,
              "",
              expanded,
              toggleNode,
            )
          )}
        </div>
      </div>

      <div className="results">
        <h3>Resultado da validação</h3>
        {validating && <p className="muted">Validando…</p>}
        {!validating && validation === null && !jsonError && !schemaError && (
          <p className="muted">Sem erros de validação.</p>
        )}
        {!validating && validation && validation.valid && (
          <p className="ok">✔ JSON válido de acordo com o schema.</p>
        )}
        {!validating && validation && !validation.valid && (
          <>
            <p className="fail">
              ✘ {validation.errors.length} erro(s) de validação.
            </p>
            <ul className="error-list">
              {validation.errors.map((err, idx) => (
                <li key={idx} className="error-item">
                  <span className="error-path">{err.path || "raiz"}</span>:{" "}
                  {err.message}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
