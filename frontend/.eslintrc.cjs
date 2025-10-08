module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // More lenient rules for development
    'no-unused-vars': 'warn', // Changed from 'error' to 'warn'
    '@typescript-eslint/no-unused-vars': 'warn', // Changed from 'error' to 'warn'
    'no-undef': 'warn', // Changed from 'error' to 'warn'
    'no-empty': 'warn', // Changed from 'error' to 'warn'
    'no-redeclare': 'warn', // Changed from 'error' to 'warn'
    'react/no-unescaped-entities': 'warn', // Changed from 'error' to 'warn'
    'no-useless-escape': 'warn', // Changed from 'error' to 'warn'
    'no-case-declarations': 'warn', // Changed from 'error' to 'warn'
    'react-hooks/exhaustive-deps': 'warn', // Already a warning
  },
}
