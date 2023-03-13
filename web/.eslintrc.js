module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended'
  ],
  rules: {
    semi: ['error', 'always', { 'omitLastInOneLineBlock': true }],
    'quotes': ['warn', 'single', {
      'avoidEscape': true,
      'allowTemplateLiterals': true
    }],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/jsx-filename-extension': [1, { 'extensions': ['.jsx', '.tsx'] }],
    'object-curly-spacing': ['warn', 'always', {
      'arraysInObjects':  false,
      'objectsInObjects':  false
    }],
    'operator-linebreak': ['warn', 'after'],
    'no-unused-vars': ['warn', {
      'argsIgnorePattern':  '^_',
      'ignoreRestSiblings': true
    }],
    'react/react-in-jsx-scope': 'off'
  }
};

