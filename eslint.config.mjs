import js from '@eslint/js';

export default [
  {
    ...js.configs.recommended,
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        document: 'readonly',
        fetch: 'readonly',
      },
    },
  },
];
