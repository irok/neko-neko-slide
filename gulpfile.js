'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const gulp_if = require('gulp-if');

const isProduct = !gutil.env.dev;

gulp.task('build', ['build:js', 'build:sass']);

gulp.task('build:js', () => {
  const uglify = require('gulp-uglify');

  return gulp.src('src/*.js')
    .pipe(plumber())
    .pipe(gulp_if(isProduct, uglify({
      mangle: {toplevel: true}
    })))
    .pipe(gulp.dest('dist/'));
});

gulp.task('build:sass', () => {
  const sass = require('gulp-sass');
  const packageImporter = require('node-sass-package-importer');

  return gulp.src('src/*.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: isProduct ? 'compressed' : 'expanded',
      importer: packageImporter({
        extensions: ['.scss', '.css']
      })
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['build'], () => {
  const browserSync = require('browser-sync').create();

  browserSync.init({
    files: ['dist/*.@(html|css|js)'],
    server: 'dist'
  });

  gulp.watch('src/*.js', ['build:js']);
  gulp.watch('src/*.scss', ['build:sass']);
});
