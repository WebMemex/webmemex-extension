module.exports = function(grunt) {

  // Looking for something?
  // The source of a grunt task or its configuration might be in:
  // 1. this file :)
  // 2. ./node_modules/grunt-*<task_name>/
  // 3. ./tasks/<task_name>.js


  // This loads all grunt tasks matching the grunt-*, @*/grunt-* patterns.
  require("load-grunt-tasks")(grunt);

  var configs = require("load-grunt-configs")(grunt, {
    config: {
      src: "tasks/*.js",
    },
  });
  grunt.initConfig(configs);

  grunt.registerTask("build", [
    "clean",
    "webpack:build",
  ]);

  grunt.registerTask("build-tests", [
    "build",
    "webpack:test",
  ]);

  grunt.registerTask("test", [
    "build-tests",
    "mochaTest",
    "lint",
  ]);

  grunt.registerTask("develop", [
    "watch:develop",
  ]);

  grunt.registerTask("lint", [
    "newer:eslint",
  ]);

};
