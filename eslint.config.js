const prettier = require('eslint-config-prettier');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'src/script.min.js',
      'sw.js',
      'src/input.css',
      'styles.css',
      'dist/',
    ],
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
