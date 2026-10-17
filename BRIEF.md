# BRIEF — editor-json-visual

## Entregas
- `package.json` — React 18 + TypeScript, scripts `dev`, `build`, `preview`, `test`, `test:watch`; `packageManager: npm@11.6.2`.
- `tsconfig.json` — `strict: true`, sem `any`; `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- `vite.config.ts` — Vite + plugin React + vitest (jsdom, globs).
- `index.html` — ponto de entrada; monta `#root`.
- `src/main.tsx` — `createRoot` + `StrictMode`.
- `src/App.tsx` — cabeçalho + `EditorJSONVisual`.
- `src/types.ts` — tipos `JsonSchema`, `ValidationError`, `ValidationResult`, `EditorState` (tipados, sem `any`).
- `src/schemaValidator.ts` — `validate(instance, schema): ValidationResult` puro, determinístico, sem `Math.random()`/`Date.now()`. Suporta: `type`, `enum`, `const`, `minimum`/`maximum`, `exclusiveMinimum`/`exclusiveMaximum`, `minLength`/`maxLength`, `pattern`, `minItems`/`maxItems`, `required`, `properties`, `additionalProperties`, `minProperties`/`maxProperties`, objetos e arrays aninhados.
- `src/EditorJSONVisual.tsx` — editor visual: dois textareas (JSON e schema), árvore colapsável do JSON parseado, validação automática com debounce e botão sob demanda, lista de erros com caminho no documento.
- `test/schemaValidator.test.ts` — vitest; tipos primitivos, enum/const, restrições numéricas, strings, objetos, arrays, aninhamento e múltiplos erros.
- `README.md` — bilíngue PT-BR + EN (título, descrição, como usar, testes, licença MIT, autor Kelvin Oliveira).
- `BRIEF.md` — este arquivo.

## Comando de teste
`npm test` (executa `vitest run`). Porta de entrada da CI: `npm run build` (roda `tsc --noEmit` + `vite build`).

## Como verificar
1. `npm install` — instala dependências.
2. `npm run build` — TypeScript strict compila sem erros e Vite faz o build.
3. `npm test` — todos os testes de `test/schemaValidator.test.ts` passam.
4. `npm run dev` — abre `http://localhost:5173`; editar JSON/schema dispara validação e a árvore visual renderiza.

## Resultado dos testes
Não executado neste ambiente: não foi possível confirmar se `npm install` conclui (depende de rede para baixar pacotes). Os arquivos de teste estão prontos e o validador é puro (sem dependências de runtime além de TypeScript), portanto os testes rodam assim que `vitest` estiver instalado.

## Caminhos
- README: `C:\Users\Kelvin\AppData\Local\Temp\opencode\github-staging\projects\editor-json-visual\README.md`
- BRIEF: `C:\Users\Kelvin\AppData\Local\Temp\opencode\github-staging\projects\editor-json-visual\BRIEF.md`
- Raiz do projeto: `C:\Users\Kelvin\AppData\Local\Temp\opencode\github-staging\projects\editor-json-visual\`
