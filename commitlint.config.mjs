export default {
  extends: ['@commitlint/config-conventional'],
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  prompt: {
    messages: {
      skip: '(press enter to skip)',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
  },
  rules: {
    'header-max-length': [2, 'always', 72],
  },
};
