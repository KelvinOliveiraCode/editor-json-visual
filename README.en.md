
# editor-json-visual

![language: JavaScript/TypeScript](https://img.shields.io/badge/language-JS-TS-yellow?logo=javascript)   ![status: done](https://img.shields.io/badge/status-done-green)   ![license: MIT](https://img.shields.io/badge/license-MIT-blue)

## Summary

Web application in JavaScript/TypeScript. Projeto funcional, editor-json-visual

## Problem / why it exists

The project delivers a web interface or utility for a specific scope, with focus on the browser as runtime and no dependency on its own server.

## Architecture

- Presentation layer: components and pages that render the interface.
- Logic layer: functions and hooks that process data and state.
- Communication: HTTP requests to external APIs or local data, when applicable.

The build is done with Vite (or equivalent tool), generating static files ready for hosting.

## Technologies

- JavaScript / TypeScript
- react
- react-dom
- @vitejs/plugin-react
- @types/react
- @types/react-dom
- typescript
- vite
- vitest
- jsdom

- No CI configured in this repository.

The repository contains automated tests.

## What it does

Projeto funcional, editor-json-visual

## How to run

Requirements: Node.js and npm (or yarn/pnpm).

```
# install dependencies
npm install

# run in development
vite

# production build
tsc --noEmit && vite build

# run tests
vitest run
```

## Project structure

- src/ (5 arquivo(s))
- test/ (1 arquivo(s))
- .gitignore, BRIEF.md, index.html, package-lock.json, package.json, README.en.md, README.md, tsconfig.json, vite.config.ts


## Trade-offs and decisions

- Static build: easy to host (GitHub Pages, Vercel, Netlify) without a server.
- Minimal dependencies to reduce maintenance surface.
- Browser as the only runtime required.

## Known limitations

- Runs in the browser; depends on internet connection for external resources.


## Tests

```
vitest run
```

## License

Distributed under the MIT License. See the `LICENSE` file in this repository.

## Author

Kelvin Oliveira, https://github.com/KelvinOliveiraCode
Portfolio: https://kelvinoliveiracode.github.io/portfolio/
