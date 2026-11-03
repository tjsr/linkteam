const assert = require('node:assert/strict');
const { createRequire } = require('node:module');

// TypeScript 7 builds the project. The lint packages still use the JavaScript
// compiler API and must resolve their supported compiler, including ts-api-utils.
const sharedRequire = createRequire(require.resolve('@tjsr/eslint-config'));
const parserRequire = createRequire(sharedRequire.resolve('@typescript-eslint/parser'));
const estreeRequire = createRequire(parserRequire.resolve('@typescript-eslint/typescript-estree'));
const apiRequire = createRequire(estreeRequire.resolve('ts-api-utils'));
const lintCompilerPath = sharedRequire.resolve('typescript');
const lintVersion = sharedRequire('typescript').version;
const [major, minor] = lintVersion.split('.').map(Number);

assert.ok(major >= 4 && (major < 6 || (major === 6 && minor === 0)),
  `Lint requires a compiler supported by typescript-eslint; found ${lintVersion}`);
for (const lintRequire of [parserRequire, estreeRequire, apiRequire]) {
  assert.equal(lintRequire.resolve('typescript'), lintCompilerPath,
    'All lint packages must resolve the shared config compiler');
}
assert.notEqual(require.resolve('typescript'), lintCompilerPath,
  'The project compiler must remain independent of lint tooling');
console.log(`Project TypeScript: ${require('typescript/package.json').version}; lint TypeScript: ${lintVersion}`);
