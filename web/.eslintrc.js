module.exports = {
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: [
    'out/',
  ],
  env: {
    browser: true,
    es2020: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    React: 'writable',
    JSX: true,
  },
  rules: {
    semi: ['error', 'always', { omitLastInOneLineBlock: true }],
    quotes: ['warn', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true,
    }],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx']}],
    'object-curly-spacing': ['warn', 'always', {
      arraysInObjects: false,
      objectsInObjects: false,
    }],
    'operator-linebreak': ['warn', 'after'],
    'quote-props': ['error', 'as-needed'],
    'react/self-closing-comp': ['error', {
      component: true,
      html: true,
    }],
    indent: ['error', 2],
    'react/jsx-max-props-per-line': ['error', { maximum: { single: 3, multi: 1 }}],
    'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
    'react/jsx-closing-bracket-location': ['error', 'line-aligned'],
    'comma-dangle': ['warn', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],
    '@typescript-eslint/no-unused-vars': [
      'warn', {
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'unknown', 'parent', 'sibling', 'index'],
        ],
        alphabetize: { order: 'ignore', caseInsensitive: true },
      },
    ],

    'react/react-in-jsx-scope': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'linebreak-style': 'off',
    'max-classes-per-file': 'off',
    'prefer-destructuring': 'off',
    'no-unused-vars': 'off',
    'max-len': 'off',
    'consistent-return': 'off',
    'react/function-component-definition': 'off',
    'import/extensions': 'off',
    'object-curly-newline': 'off',
    'react/require-default-props': 'off',
    'arrow-parens': 'off',
    'react/jsx-props-no-spreading': 'off',
    'arrow-body-style': 'off',
    'no-multiple-empty-lines': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
