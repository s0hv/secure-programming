module.exports = {
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  ignorePatterns: [
    'out/'
  ],
  env: {
    browser: true,
    es2020: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  globals: {
    React: 'writable'
  },
  rules: {
    semi: ['error', 'always', { omitLastInOneLineBlock: true }],
    quotes: ['warn', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx']}],
    'object-curly-spacing': ['warn', 'always', {
      arraysInObjects:  false,
      objectsInObjects:  false
    }],
    'operator-linebreak': ['warn', 'after'],
    'no-unused-vars': ['warn', {
      argsIgnorePattern:  '^_',
      ignoreRestSiblings: true
    }],
    'quote-props': ['error', 'as-needed'],
    'react/self-closing-comp': ['error', {
      component: true,
      html: true
    }],
    indent: ['error', 2],
    'react/jsx-max-props-per-line': ['error', { maximum: { single: 2, multi:  1 }}],
    'react/jsx-first-prop-new-line':['error', 'multiline-multiprop'],
    'react/jsx-closing-bracket-location': ['error', 'line-aligned'],

    'react/react-in-jsx-scope': 'off'
  }
};

