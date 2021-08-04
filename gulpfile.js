const gulp = require('gulp');
const hbs = require('gulp-hb');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const versionNumber = require('gulp-version-number');
const browserSync = require('browser-sync').create();

gulp.task('html', function() {
  return gulp
    .src('./src/*.hbs')
    .pipe(hbs()
      .partials('./src/templates/partials/**/*.hbs')
      .helpers({
        year: function () { return (new Date().getFullYear())}
      })
      .data('./src/templates/data/**/*.{js,json}')
    )
    .pipe(rename({
      extname: '.html',
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
    }))
    .pipe(versionNumber({
      value: '%MDS%',
      append: {
        key: 'v',
        to: ['css'],
      },
    }))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('./'));
});

gulp.task('scss', function() {
  //noinspection JSUnresolvedFunction
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass({
      style: 'expanded',
      includePaths: [
        require('node-reset-scss').includePath,
        'node_modules/sass-mq',
      ],
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./css'))
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: '.min' }))
    .pipe(csso())
    .pipe(sourcemaps.write('./'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('./css'));
});

gulp.task('watcher', function() {
  browserSync.init({
    server: {
      baseDir: './',
    },
    port: 8080,
    open: true,
    notify: false,
  });

  gulp.watch('./src/**/*.hbs', gulp.series('html'));
  gulp.watch('./src/**/*.json', gulp.series('html'));
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
});

gulp.task('build', gulp.series(gulp.parallel('html', 'scss')));

gulp.task('default', gulp.series('watcher'));
