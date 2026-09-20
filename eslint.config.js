const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    rules: {
      // === File Size — enforced at lint time ===
      'max-lines': [
        'error',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // === TypeScript ===
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // === React ===
      'react/self-closing-comp': 'warn',
    },
  },
  {
    ignores: ['node_modules/', '.expo/', 'dist/', '*.config.js'],
  },
]);
