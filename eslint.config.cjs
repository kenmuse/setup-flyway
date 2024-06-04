// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

// import * as eslintplugin from "eslint-plugin-jest";
// ...eslintplugin.configs['flat/recommended'].rules,

// This is a reusable configuration file copied from https://github.com/actions/reusable-workflows/tree/main/reusable-configurations. Please don't make changes to this file as it's the subject of an automatic update.
module.exports = tseslint.config(
  {
    ignores: [
      '**/eslint.config.cjs',
      '**/jest.config.mjs',
      '**/dist/',
      '**/coverage/',
      '**/.yarn/',
      '.pnp.cjs',
      '.pnp.loader.mjs',
      'package.json'
    ],
  },
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    files: [
      'test/**/*.test.mts',
      'src/**/*.mts',
    ],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description'
        }
      ],
      'no-console': 'error',
      'yoda': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'all'
        }
      ],
      'no-control-regex': 'off',
      'no-constant-condition': ['error', {checkLoops: false}]
    }
  });