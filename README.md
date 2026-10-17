# editor-json-visual

Editor visual de JSON com validação de schema JSON. Stack: React 18 + TypeScript.

## Português

### Descrição
Editor visual de JSON que edita o documento e valida contra um schema JSON. Mostra o JSON como árvore colapsável, destaca erros de validação com o caminho no documento e aceita o padrão mais usado do JSON Schema (tipo, obrigatório, propriedades, itens, tamanho, intervalo, padrão, enum).

### Como usar
Instale as dependências:

npm install

Inicie o servidor de desenvolvimento:

npm run dev

Abra http://localhost:5173. Cole um JSON e um schema, ou use os exemplos pré-carregados. A validação roda automaticamente ao mudar os textos; o botão "Validar JSON" dispara a checagem sob demanda.

### Testes
Os testes cobrem o validador de schema (tipos, enum, const, intervalo, strings, objetos, arrays e erros aninhados).

npm test

Para compilar e testar (porta de entrada da CI):

npm run build

### Licença
MIT

### Autor
Kelvin Oliveira

## English

### Description
Visual JSON editor that edits the document and validates it against a JSON schema. Renders the JSON as a collapsible tree, highlights validation errors with the path in the document, and supports the most common JSON Schema keywords (type, required, properties, items, size, range, pattern, enum).

### How to use
Install dependencies:

npm install

Start the dev server:

npm run dev

Open http://localhost:5173. Paste a JSON document and a schema, or use the preloaded examples. Validation runs automatically when the text changes; the "Validar JSON" button runs it on demand.

### Tests
Tests cover the schema validator (types, enum, const, range, strings, objects, arrays, nested errors).

npm test

To build and test (CI entry point):

npm run build

### License
MIT

### Author
Kelvin Oliveira
