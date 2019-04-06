module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
 extends: 'standard',
  globals: {
    __static: true
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_'
      }
    ],
    'camelcase': 'off',
    '@typescript-eslint/camelcase': 'off'
  }
}
