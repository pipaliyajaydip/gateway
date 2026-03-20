import n from 'eslint-plugin-n';

export default [
  {
    files: ['**/*.js'],
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.test.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      n
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],

      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',

      'n/no-missing-import': 'error',
      'n/no-unpublished-import': 'off',

      eqeqeq: ['error', 'always'],
      curly: 'error'
    }
  }
];
