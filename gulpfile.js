const {task, src, dest, parallel} = require('gulp');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const packageImporter = require('node-sass-package-importer');

const buildJs = function() {
  return src('src/*.js')
    .pipe(uglify({
      mangle: {toplevel: true}
    }))
    .pipe(dest('dist'));
};
buildJs.displayName = 'build:js';
task(buildJs);

const buildSass = function() {
  return src('src/*.scss')
    .pipe(sass({
      outputStyle: 'compressed',
      importer: packageImporter({
        extensions: ['.scss', '.css']
      })
    }))
    .pipe(dest('dist'));
};
buildSass.displayName = 'build:sass';
task(buildSass);

exports.build = parallel(buildJs, buildSass);
