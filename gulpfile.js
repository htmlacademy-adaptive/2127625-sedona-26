import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import svgtore from 'gulp-svgstore';
import svgo from 'gulp-svgo';
import htmlmin from 'gulp-htmlmin';
import squoosh from 'gulp-libsquoosh';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import { deleteAsync } from 'del';

// html
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(gulp.dest('build'));
};

// styles
export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
};

// scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
};

// images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img'));
};

// webp
const createWebP = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({
      webp: {},
    }))
    .pipe(gulp.dest('build/img'));
};

// svg
const svg = () => {
  return gulp.src([
    'source/img/**/*.svg',
     '!source/img/icons/*.svg'
    ])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
};

// sprite
const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgtore({
      inlineSvg: true,
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};

// copy
const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
};

// clean
const clean = () => {
  return deleteAsync('build');
};

// server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/navigation.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebP
  ),
);

// default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebP
  ),
  gulp.series(
    server,
    watcher
  )
);
