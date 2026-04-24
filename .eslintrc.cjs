module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
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
    // Point the import plugin at the root package.json so it resolves dependencies correctly
    'import/no-extraneous-dependencies': ['error', { packageDir: [__dirname] }],
    // Airbnb bans default export in some cases; keep defaults for page-level components
    'import/prefer-default-export': 'off',
    // Allow JSX in .tsx files only
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    // With new JSX transform, React import is not needed
    'react/react-in-jsx-scope': 'off',
    // Named arrow-function components are fine
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],
    // Default parameter values in destructuring are the modern TS equivalent of defaultProps
    'react/require-default-props': ['error', { functions: 'defaultArguments' }],
    // Array index is the correct key for purely decorative/positional elements (progress segments, sparkles)
    'react/no-array-index-key': 'off',
    // The // prefix is an intentional design label style throughout this app, not accidental JS comments
    'react/jsx-no-comment-textnodes': 'off',
    // autoFocus is intentional on first form field for keyboard UX
    'jsx-a11y/no-autofocus': 'off',
  },
};
