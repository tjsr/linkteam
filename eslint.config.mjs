import tjsrEslintConfig from '@tjsr/eslint-config';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import-x';

// Preserve the shared import rules with an ESLint 10-compatible implementation.
const compatibleConfig = tjsrEslintConfig.map((config) => config.plugins?.import
  ? { ...config, plugins: { ...config.plugins, import: importPlugin } }
  : config);

export default tseslint.config(
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
