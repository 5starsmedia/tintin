module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    clean: ['doc'],
    jsdoc: {
      all: {
        src: ['lib/**/*.js'],
        options: {
          destination: 'doc',
          private:false
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.registerTask('doc', ['jsdoc:all']);
};
