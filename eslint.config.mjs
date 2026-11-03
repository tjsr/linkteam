import tjsrEslintConfig from '@tjsr/eslint-config';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import-x';

// Preserve the shared import rules with an ESLint 10-compatible implementation.
const compatibleConfig = tjsrEslintConfig.map((config) => config.plugins?.import
  ? { ...config, plugins: { ...config.plugins, import: importPlugin } }
  : config);

// The shared config owns typescript-eslint and its supported nested compiler.
// The project build uses TypeScript 7 independently.
export default defineConfig(
{
  ignores: ['dist'],
},
{
  extends: [
    ...compatibleConfig,
  ],
  files: ["src/**/*.ts"],
  languageOptions: {
    globals:{
      es2021: true,
      node: true,
    },
  },
});
