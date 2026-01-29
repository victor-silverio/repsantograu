const prettier = require('../config/node_modules/eslint-config-prettier');
const js = require('../config/node_modules/@eslint/js');
const globals = require('../config/node_modules/globals');

module.exports = [
  {
    ignores: ['script.min.js', 'input.css'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  prettier,
];
