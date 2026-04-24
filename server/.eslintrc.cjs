module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
    },
  },
  rules: {
    semi: 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    'import/no-extraneous-dependencies': ['error', { packageDir: [__dirname] }],
    'import/prefer-default-export': 'off',
    // Server logs are intentional — no-console is a browser-only concern
    'no-console': 'off',
    // Seed data and Drizzle column selects are more readable as one-liners
    'object-curly-newline': 'off',
    // Zod and Drizzle builder chains are idiomatic on one line
    'newline-per-chained-call': 'off',
    // Express error handlers intentionally have unused _next parameter
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
