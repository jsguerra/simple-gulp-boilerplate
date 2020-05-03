// Set Gulp variables
const { src, dest, watch, series, parallel } = require('gulp');

// Set style variables
const sass = require('gulp-sass'),
      cssnano = require("cssnano"),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      sourcemaps = require('gulp-sourcemaps');

// Set sass compiler
sass.compiler = require('node-sass');

// Set js variables
const babel = require('gulp-babel'),
      rename = require('gulp-rename'),
      uglify = require('gulp-uglify'),
      imagemin = require('gulp-imagemin');
  
// Set browser sync variable
const browserSync = require('browser-sync').create();

// Setup file paths
const source = './src',
      scss = source + '/sass/',
      js = source + '/js/',
      imgSrc = source + '/images/',
      fontSrc = source + '/fonts/',
      app = './app';

// Styles task
const styles = (cb) => {
  return src(scss + '**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      indentType: 'tab',
      indentWidth: '1'
    }).on('error', sass.logError))
    .pipe(
      postcss(
        [
          autoprefixer('last 2 versions', '> 1%'),
          cssnano()
        ]
      ))
    .pipe(sourcemaps.write())
    .pipe(dest(app))
    .pipe(browserSync.stream())

  cb();
}

// Javascript task
const scripts = (cb) => {
  return src(js + '**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [
        [
          '@babel/env',
          {
            "useBuiltIns": "usage",
            "corejs": "3",
            "targets": {
              "browsers": [
                "last 5 versions",
                "ie >= 8"
              ]
            }
          }
        ]
      ]
    }))
    .pipe(sourcemaps.write())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(app + '/js/'))

  cb();
}

// Images task
const imageTask = (cb) => {
  return src(imgSrc + '*')
    .pipe(imagemin())
    .pipe(dest(app + '/images/'));

  cb();
}

// Fonts task
const fontTask = (cb) => {
  return src(fontSrc + '*')
    .pipe(dest(app + '/fonts/'));
    
  cb();
}

// HTML task
const htmlTask = (cb) => {
  return src(source + '/**/*.html')
    .pipe(dest(app));

  cb();
}

// Server task
const startServer = (cb) => {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  })
  cb();
}

// Watch Task
const watchTask = (cb) => {
  watch([scss + '**/*.scss'], styles);
  watch([js + '**/*.js'], scripts).on('change', browserSync.reload);
  watch([imgSrc + '*'], imageTask).on('change', browserSync.reload);
  watch([fontSrc + '*'], fontTask).on('change', browserSync.reload);
  watch([source + '/**/*.html'], htmlTask).on('change', browserSync.reload);

  cb();
}

// Exports
exports.default = series(
  parallel(styles, scripts, imageTask, fontTask, htmlTask),
  parallel(startServer, watchTask)
);