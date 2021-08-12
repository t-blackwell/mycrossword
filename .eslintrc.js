module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  extends: ['airbnb-typescript', 'prettier'],
  root: true,
  env: {
    browser: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'build/**/*'],
  rules: {
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
    ],
  },
};
