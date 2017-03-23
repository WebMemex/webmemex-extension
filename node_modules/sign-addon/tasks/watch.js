module.exports = {
  options: {
    atBegin: true,
    interrupt: true,
  },
  develop: {
    files: [
      'package.json',
      'src/**/*.js',
      'tasks/**/*.js*',
      'tests/**/*.js*',
      'webpack.config.js',
    ],
    tasks: [
      'build-tests',
      'mochaTest',
      'lint',
    ],
  },
};
