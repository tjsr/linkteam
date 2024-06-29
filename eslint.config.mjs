import tjsrEslintConfig from '@tjsr/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ["**/src/*.ts"],
  ignores: ["dist/**"],
  extends: [
    ...tjsrEslintConfig,
  ],
});
