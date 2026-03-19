# PRD: Migrate Wampy.js to TypeScript

## Introduction

**Type:** Chore

Migrate the entire wampy.js codebase (source, tests, CLI) from JavaScript to TypeScript with strict typing. Replace the legacy Grunt-based build system with `tsup` for modern ESM + CJS + UMD output. Remove JSDoc type annotations (keeping only descriptions/examples) since TypeScript types make them redundant. All existing tests must continue to pass with the same coverage.

## Goals

- Convert all `.js` source files in `src/`, `test/`, and `cmd/` to `.ts`
- Add strict TypeScript types for all internal structures, enums, constants, and interfaces
- Preserve `any` only for user-supplied payloads (RPC arguments, event data, etc.) since this is a library accepting arbitrary user data
- Remove JSDoc `@param`/`@returns`/`@type` type annotations, keeping only textual descriptions and examples
- Replace Grunt build pipeline with `tsup` producing ESM, CJS, and UMD browser bundles
- Maintain all existing test coverage and passing tests
- Generate `.d.ts` declaration files for consumers
- Support Node.js 20+ / ES2023 target

## User Stories

### US-001: Add TypeScript infrastructure and configuration

**Description:** As a developer, I want TypeScript compiler configuration and build tooling in place so that the migration can begin.

**Acceptance Criteria:**
- [ ] `tsconfig.json` created with `"strict": true`, `"target": "ES2023"`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"declaration": true`, `"declarationMap": true`, `"sourceMap": true`
- [ ] `include` covers `src/`, `cmd/`, `test/`
- [ ] `outDir` set to `dist/`
- [ ] `tsup` installed as dev dependency with a `tsup.config.ts` configuration file
- [ ] `tsup` config produces: ESM (`dist/esm/`), CJS (`dist/cjs/`), and UMD browser bundles (`dist/browser/`)
- [ ] UMD browser bundles replicate current behavior: `wampy.js` (single, sets `globalThis.Wampy`), `wampy-all.js` (all serializers + auth), plus minified versions
- [ ] `browser.zip` is produced containing browser bundles (equivalent to current Grunt `compress` task)
- [ ] `package.json` updated: `devDependencies` adds `typescript`, `tsup`, `@types/node`; removes Babel, Grunt, and browserify related packages
- [ ] `package.json` `scripts.build` changed to use `tsup`
- [ ] `.babelrc` removed (no longer needed)
- [ ] `Gruntfile.cjs` removed
- [ ] `npm run build` succeeds and produces correct output structure
- [ ] Typecheck passes (`tsc --noEmit`)

### US-002: Convert source utility and constant files to TypeScript

**Description:** As a developer, I want the foundational modules (`constants.ts`, `errors.ts`, `utils.ts`) converted to TypeScript with proper types so that the main module can depend on them.

**Acceptance Criteria:**
- [ ] `src/constants.js` → `src/constants.ts` with:
  - `WAMP_MSG_SPEC` as a `const enum` or `as const` object with numeric values
  - `WAMP_ERROR_MSG` as a typed `Record` or `as const` object
  - `SUCCESS` constant typed
  - `E2EE_SERIALIZERS` typed as `ReadonlySet<string>` or similar
  - `WAMP_CUSTOM_ATTR_REGEX` typed as `RegExp`
  - `isNode` typed as `boolean`
- [ ] `src/errors.js` → `src/errors.ts` with:
  - All 24 error classes properly typed with `readonly code: number` and `readonly message: string`
  - Base `WampError` class typed with `details` property
  - Error constructor parameters typed
- [ ] `src/utils.js` → `src/utils.ts` with:
  - `getWebSocket()` return type properly defined (WebSocket constructor type)
  - `getNewPromise<T>()` generic, returning a typed deferred object `{ promise: Promise<T>, resolve: (value: T) => void, reject: (reason?: unknown) => void }`
- [ ] JSDoc type annotations (`@type`, `@param`, `@returns`) removed from these files; textual descriptions preserved
- [ ] Typecheck passes

### US-003: Convert serializers to TypeScript with a common interface

**Description:** As a developer, I want serializers to implement a common `Serializer` interface so that type safety is enforced for pluggable serializers.

**Acceptance Criteria:**
- [ ] A `Serializer` interface (or abstract class) defined in `src/serializers/serializer.ts` (or similar) with:
  - `protocol: string`
  - `isBinary: boolean`
  - `encode(data: unknown): string | ArrayBuffer | Uint8Array`
  - `decode(data: string | ArrayBuffer | Uint8Array): unknown`
- [ ] `src/serializers/json-serializer.js` → `src/serializers/json-serializer.ts` implementing `Serializer`
- [ ] `src/serializers/cbor-serializer.js` → `src/serializers/cbor-serializer.ts` implementing `Serializer`
- [ ] `src/serializers/msgpack-serializer.js` → `src/serializers/msgpack-serializer.ts` implementing `Serializer`
- [ ] JSDoc type annotations removed; textual descriptions preserved
- [ ] Typecheck passes

### US-004: Convert auth plugins to TypeScript

**Description:** As a developer, I want the authentication plugins (WAMP-CRA, Cryptosign) converted to TypeScript with proper types for their factory functions and crypto operations.

**Acceptance Criteria:**
- [ ] `src/auth/wampcra/wampy-cra.js` → `src/auth/wampcra/wampy-cra.ts` with:
  - `deriveKey(secret: string, salt: string, iterations: number, keyLen: number): Promise<CryptoKey>`
  - `signManual(key: CryptoKey, challenge: string): Promise<string>`
  - `sign(secret: string, extra: { salt: string, iterations: number, keylen: number }): () => Promise<string>` (factory return type)
  - Proper typing for Web Crypto API usage
- [ ] `src/auth/cryptosign/wampy-cryptosign.js` → `src/auth/cryptosign/wampy-cryptosign.ts` with:
  - `hex2bytes(hex: string): Uint8Array`
  - `bytes2hex(bytes: Uint8Array): string`
  - `sign(privateKey: string): (challenge: string) => string` (factory return type)
  - Proper typing for tweetnacl usage
- [ ] JSDoc type annotations removed; textual descriptions preserved
- [ ] Typecheck passes

### US-005: Define core Wampy types and interfaces

**Description:** As a developer, I want comprehensive TypeScript type definitions for the Wampy class internals — options, cache structures, callback shapes, WAMP message types — so that the main class conversion is fully typed.

**Acceptance Criteria:**
- [ ] A types file (e.g., `src/types.ts`) created containing:
  - `WampyOptions` interface — all constructor/config options typed (url, realm, authid, authmethods, onChallenge, onConnect, onClose, onError, onReconnect, serializer, ws, wsRequestOptions, maxRetries, reconnectInterval, etc.)
  - `WampyOpStatus` interface — `code: number`, `error: string`, `reqId: number`, etc.
  - `SubscriptionCallbacksHash` / `RegistrationCallbacksHash` — maps/records for internal caches
  - `CallResult` / `EventData` / `InvocationData` — typed structures for data arriving from router
  - `AdvancedOptions` interfaces for subscribe/publish/call/register advanced features (PPT, E2EE, progressive calls, etc.)
  - `ProgressiveCallSendData` and `ProgressiveCallReturn` types (currently JSDoc `@typedef`)
  - Enum or union types for WAMP message IDs
  - Type for internal cache/state structure (sessionId, reqId, timers, server features, etc.)
- [ ] User-supplied payloads (args, kwargs, event data) typed as `any` or `unknown` with appropriate generics
- [ ] Property descriptions added directly to interface/type properties where helpful
- [ ] Typecheck passes

### US-006: Convert main Wampy class to TypeScript

**Description:** As a developer, I want the main `Wampy` class (`src/wampy.js`) fully converted to TypeScript with strict types on all private and public members.

**Acceptance Criteria:**
- [ ] `src/wampy.js` → `src/wampy.ts`
- [ ] All ~40 private methods typed with parameter and return types
- [ ] All ~16 public API methods typed with parameter and return types
- [ ] All private properties typed (replace `@type` JSDoc with actual TS types)
- [ ] Constructor overloads typed: `new Wampy()`, `new Wampy(url)`, `new Wampy(options)`, `new Wampy(url, options)`
- [ ] Internal caches/maps (subscriptions, RPCs, requests) strongly typed
- [ ] WebSocket instance typed
- [ ] Timer references typed (`ReturnType<typeof setTimeout> | null` or similar)
- [ ] All JSDoc `@param`, `@returns`, `@type`, `@private` annotations removed
- [ ] JSDoc textual descriptions (what a method does, examples, `@deprecated`) preserved
- [ ] Exports remain: `export default Wampy`, `export { Wampy }`, `export * as Errors from './errors'`
- [ ] Typecheck passes

### US-007: Convert browser wrapper files to TypeScript

**Description:** As a developer, I want the browser entry-point wrappers converted to TypeScript.

**Acceptance Criteria:**
- [ ] `src/wampy-single-4-browser.js` → `src/wampy-single-4-browser.ts` — sets `globalThis.Wampy` with proper type augmentation
- [ ] `src/wampy-all-4-browser.js` → `src/wampy-all-4-browser.ts` — sets all globals with proper type augmentation
- [ ] Typecheck passes

### US-008: Convert CLI tool to TypeScript

**Description:** As a developer, I want the CLI tool (`cmd/`) converted to TypeScript so the entire codebase is uniformly typed.

**Acceptance Criteria:**
- [ ] `cmd/cli.js` → `cmd/cli.ts` (with `#!/usr/bin/env node` shebang preserved in build output)
- [ ] `cmd/main.js` → `cmd/main.ts` — yargs setup typed
- [ ] `cmd/common-options.js` → `cmd/common-options.ts`
- [ ] `cmd/logger.js` → `cmd/logger.ts`
- [ ] `cmd/wampy-helpers.js` → `cmd/wampy-helpers.ts`
- [ ] `cmd/commands/call.js` → `cmd/commands/call.ts`
- [ ] `cmd/commands/publish.js` → `cmd/commands/publish.ts`
- [ ] `cmd/commands/subscribe.js` → `cmd/commands/subscribe.ts`
- [ ] `cmd/commands/register.js` → `cmd/commands/register.ts`
- [ ] All function parameters and return types annotated
- [ ] JSDoc type annotations removed; textual descriptions preserved
- [ ] Typecheck passes

### US-009: Convert test files to TypeScript

**Description:** As a developer, I want all test files converted to `.ts` so they benefit from type checking, while keeping their logic and coverage identical.

**Acceptance Criteria:**
- [ ] All `test/*.js` files renamed to `test/*.ts`
- [ ] Test helper files (`fake-ws.js`, `fake-ws-set-protocol.js`, `fake-wampy-mock.js`, `send-data.js`) renamed to `.ts` and minimally typed
- [ ] Mocha/Chai/Sinon usage typed (add `@types/mocha`, `@types/chai`, `@types/sinon` as devDependencies)
- [ ] No logic changes — tests remain functionally identical
- [ ] Tests are not deeply refactored, just enough typing to compile under `strict: true`
- [ ] Typecheck passes

### US-010: Update test runner and coverage configuration

**Description:** As a developer, I want the test infrastructure updated to run TypeScript tests with the same coverage reporting.

**Acceptance Criteria:**
- [ ] Test runner configured to handle `.ts` files — either via `tsx`, `ts-node`, or `@swc-node/register` as a mocha require hook (replacing `@babel/register`)
- [ ] `package.json` test scripts updated to reference `.ts` test files
- [ ] `c8` coverage config (`.c8rc.json`) updated: `include` patterns changed from `*.js` to `*.ts`
- [ ] `karma.conf.cjs` updated (or replaced) to handle TypeScript for browser tests
- [ ] `npm run test:node-no-browser-wrappers` passes all tests
- [ ] `npm run test:browser-wrappers` passes all tests
- [ ] `npm run test:browser` passes all tests (or documented alternative if Karma is replaced)
- [ ] Code coverage remains at the same level (no regression)

### US-011: Update package.json exports and module configuration

**Description:** As a developer, I want `package.json` updated so that consumers get proper ESM, CJS, and type definitions when importing the library.

**Acceptance Criteria:**
- [ ] `"main"` points to CJS entry (`dist/cjs/wampy.cjs` or similar)
- [ ] `"module"` points to ESM entry (`dist/esm/wampy.js` or similar)
- [ ] `"types"` points to declaration entry (`dist/esm/wampy.d.ts` or similar)
- [ ] `"exports"` map updated with `"import"`, `"require"`, and `"types"` conditions for each entry point (`.`, `./JsonSerializer.js`, `./CborSerializer.js`, `./MsgpackSerializer.js`, `./cryptosign.js`, `./wampcra.js`)
- [ ] `"bin"` entry updated to point to compiled CLI output
- [ ] `"files"` field added (or updated) to include only necessary dist files and type declarations
- [ ] `"type": "module"` retained or adjusted as appropriate for the dual-package setup
- [ ] Consumers can `import Wampy from 'wampy'` (ESM) and `const Wampy = require('wampy')` (CJS) successfully
- [ ] TypeScript consumers get full autocompletion and type checking via bundled `.d.ts` files

### US-012: Update ESLint configuration for TypeScript

**Description:** As a developer, I want ESLint updated to lint TypeScript files with appropriate rules.

**Acceptance Criteria:**
- [ ] `typescript-eslint` parser and plugin added as dev dependencies
- [ ] `eslint.config.js` updated to handle `.ts` files with TypeScript-specific rules
- [ ] Existing rules (unicorn, security, mocha) still apply where relevant
- [ ] `npm run lint` passes on all `.ts` files
- [ ] No new lint warnings introduced

### US-013: Update CI/CD pipeline

**Description:** As a developer, I want the GitHub Actions workflow updated to work with the TypeScript codebase.

**Acceptance Criteria:**
- [ ] `.github/workflows/build-and-test.yml` updated:
  - Build step uses `npm run build` (now `tsup`)
  - Test step runs TypeScript tests
  - Node.js matrix updated to 20, 22 (dropping 18 per ES2023 target)
- [ ] Coveralls integration still works with updated coverage output
- [ ] CI passes on all matrix configurations

### US-014: Clean up removed files and update documentation

**Description:** As a developer, I want obsolete files removed and documentation updated to reflect the TypeScript migration.

**Acceptance Criteria:**
- [ ] All original `.js` source files in `src/` removed (replaced by `.ts`)
- [ ] All original `.js` test files in `test/` removed (replaced by `.ts`)
- [ ] All original `.js` CLI files in `cmd/` removed (replaced by `.ts`)
- [ ] `Gruntfile.cjs` removed
- [ ] `.babelrc` removed
- [ ] `karma.conf.cjs` removed or updated
- [ ] `.gitignore` updated if dist output structure changed
- [ ] `README.md` updated: installation, usage examples reflect TypeScript, mention `.d.ts` types available out of the box
- [ ] `CONTRIBUTING.md` updated with new build/test instructions

## Functional Requirements

- FR-1: All source files (`src/`, `cmd/`) must be TypeScript (`.ts`) with `strict: true` compilation
- FR-2: All internal types (options, cache structures, message formats, enums, constants) must be explicitly typed — no implicit `any`
- FR-3: User-supplied payloads (RPC args/kwargs, event data, publish payload) remain `any` since the library accepts arbitrary user data
- FR-4: JSDoc annotations for types (`@param`, `@returns`, `@type`, `@private`) must be removed; textual descriptions, examples, and `@deprecated` preserved
- FR-5: Build must produce ESM (`.js` with `import/export`), CJS (`.cjs` with `require/module.exports`), and UMD browser bundles
- FR-6: Build must produce `.d.ts` declaration files for all public exports
- FR-7: UMD browser bundles must set `globalThis.Wampy` (single) and `globalThis.{JsonSerializer,MsgpackSerializer,CborSerializer,WampyCryptosign}` (all-in-one), matching current behavior
- FR-8: Minified browser bundles with source maps must be produced
- FR-9: `browser.zip` containing browser bundles must be produced
- FR-10: All existing tests must pass without logic changes
- FR-11: Code coverage must not regress
- FR-12: ESLint must be configured for TypeScript linting
- FR-13: CI must build, lint, and test the TypeScript codebase
- FR-14: The library must work in both Node.js (20+) and browser environments
- FR-15: Compiled output targets ES2023

## Non-Goals

- No refactoring of the Wampy class architecture (no splitting the monolithic class)
- No changes to the public API surface or behavior
- No new features or bug fixes — this is a pure infrastructure migration
- No deep refactoring of test logic — tests should be minimally changed to compile as TypeScript
- No migration away from Mocha/Chai/Sinon test framework
- No changes to the WAMP protocol implementation
- No removal or modification of the CLI tool functionality

## Technical Considerations

- **tsup** uses esbuild internally for fast bundling and can produce ESM, CJS, and IIFE/UMD formats from TypeScript source
- The `globalThis` augmentation for browser wrappers requires TypeScript `declare global` blocks
- `tweetnacl` has `@types/tweetnacl` or built-in types; verify compatibility
- `cbor-x` and `msgpackr` may need type stubs or `declare module` if they lack type definitions
- The `websocket` npm package (used for Node.js W3C WebSocket) may need type declarations
- Mocha tests currently use `@babel/register` for runtime transpilation; this must be replaced with a TypeScript-aware loader (`tsx`, `ts-node/esm`, or `@swc-node/register`)
- Karma browser tests use `karma-browserify` with `babelify`; this needs replacement (e.g., `karma-esbuild` or `karma-webpack` with ts-loader)
- The `cmd/cli.js` has a shebang (`#!/usr/bin/env node`) — ensure the build output preserves it
- The dual ESM/CJS package requires careful `package.json` `exports` configuration to avoid the "dual package hazard"

## Success Metrics

- `tsc --noEmit` passes with zero errors under `strict: true`
- `npm run build` produces ESM, CJS, UMD, `.d.ts`, and `browser.zip`
- All existing tests pass: `npm test` exits 0
- Code coverage is equal to or greater than pre-migration level
- `npm run lint` passes with zero errors
- TypeScript consumers importing the library get full IntelliSense/autocompletion
- CI pipeline passes on Node.js 20 and 22

## Open Questions

- Should `karma` browser testing be replaced entirely with a simpler approach (e.g., running tests in jsdom only, or using Playwright)? Karma is in maintenance mode.
- Should the `websocket` npm dependency (W3C WebSocket polyfill for Node) be dropped in favor of just `ws`, given the Node 20+ target?
- Should entry point paths in `exports` map change (e.g., `wampy/json-serializer` instead of `wampy/JsonSerializer.js`)?
