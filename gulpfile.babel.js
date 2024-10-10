'use strict';

import gulpLoadPlugins from 'gulp-load-plugins';
import yargs         from 'yargs';
import browser       from 'browser-sync';
import gulp          from 'gulp';
import panini        from 'panini';
import del from 'del'; // Замена rimraf на del
import webpackStream from 'webpack-stream';
import webpack2      from 'webpack';
import named         from 'vinyl-named';
import gulpSass      from 'gulp-sass';
import sass          from 'sass';

// Загружаем все Gulp плагины в одну переменную
const $ = gulpLoadPlugins({ overridePattern: false, pattern: ['*'], rename: { 'gulp-sass': 'sassPlugin' } });
const sassPlugin = gulpSass(sass);

// Проверяем наличие флага --production
const PRODUCTION = !!(yargs.argv.production);

// Дополнительные действия
const dist = 'dist';
const src = 'src';
const assets = ['src/assets/**/*', '!src/assets/{img,js,scss,cstm-css,cstm-js}/**/*'];

// Сборка папки "dist", выполняя все задачи ниже
// Sass должен выполняться позже, чтобы PurgeCSS мог найти используемые классы в других ресурсах.
gulp.task('build', gulp.series(clean, gulp.parallel(pages, javascript, images, copy, customCss, customJs), gulp.parallel(sassTask, removeNeedless)));

// Сборка сайта, запуск сервера и наблюдение за изменениями файлов
gulp.task('default', gulp.series('build', server, watch));

// Удаление папки "dist"
// Это происходит каждый раз, когда начинается сборка
function clean() {
  return del([dist]);
}

function removeNeedless() {
  return del([`${dist}/assets/scss`, `${dist}/assets/cstm-css`, `${dist}/assets/cstm-js`]);
}

// Копирование файлов из папки assets
// Эта задача пропускает папки "img", "js" и "scss", которые обрабатываются отдельно
function copy() {
  return gulp.src(assets)
    .pipe(gulp.dest(`${dist}/assets`));
}

// Копирование шаблонов страниц в готовые HTML файлы
function pages() {
  return gulp.src(`${src}/pages/**/*.{html,hbs,handlebars}`)
    .pipe($.plumber())
    .pipe(panini({
      root: `${src}/pages/`,
      layouts: `${src}/layouts/`,
      partials: `${src}/partials/`
    }))
    .pipe(gulp.dest(dist));
}

// Загрузка обновленных шаблонов и частичных HTML в Panini
function resetPages(done) {
  panini.refresh();
  codeValidation();
  done();
}

// Линтеры для HTML и SCSS
function codeValidation() {
  return gulp.src("./dist/**/*.html")
    .pipe($.htmlhint({
      "tagname-lowercase": true,
      "attr-lowercase": true,
      "attr-value-double-quotes": true,
      "attr-value-not-empty": true,
      "attr-no-duplication": true,
      "doctype-first": true,
      "tag-pair": true,
      "empty-tag-not-self-closed": true,
      "spec-char-escape": false,
      "id-unique": true,
      "src-not-empty": true,
      "title-require": true,
      "alt-require": false,
      "doctype-html5": true,
      "id-class-value": false,
      "style-disabled": true,
      "inline-style-disabled": false,
      "inline-script-disabled": false,
      "space-tab-mixed-disabled": "disable",
      "id-class-ad-disabled": true,
      "href-abs-or-rel": false,
      "attr-unsafe-chars": false,
      "head-script-disabled": true
    }))
    .pipe($.htmlhint.reporter());
}

// Компиляция Sass в CSS
// В продакшн-режиме CSS сжимается
function sassTask() {
  return gulp.src(`${src}/assets/scss/app.scss`)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(sassPlugin().on('error', sassPlugin.logError))
    .pipe($.if(PRODUCTION, $.purgecss({ content: [`${dist}/assets/js/**/*.js`, `${dist}/**/*.html`] })))
    .pipe($.if(PRODUCTION, $.autoprefixer(['> 1%'])))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(`${dist}/assets/css`))
    .pipe(browser.reload({ stream: true }));
}

// Компиляция пользовательского CSS в один файл
// В продакшн-режиме CSS сжимается
function customCss() {
  return gulp.src(`${src}/assets/cstm-css/**/*.css`)
    .pipe($.sourcemaps.init())
    .pipe($.concat('cstm-css.css'))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(`${dist}/assets/css`));
}

function customJs() {
  return gulp.src(`${src}/assets/cstm-js/**/*.js`)
    .pipe($.sourcemaps.init())
    .pipe($.concat('cstm-js.js'))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(`${dist}/assets/js`));
}

let webpackConfig = {
  mode: (PRODUCTION ? 'production' : 'development'),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"],
            compact: false
          }
        }
      }
    ]
  },
  devtool: !PRODUCTION && 'source-map'
}

// Объединение JavaScript в один файл
// В продакшн-режиме файл сжимается
function javascript() {
  return gulp.src(`${src}/assets/js/app.js`)
    .pipe($.plumber())
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe($.if(PRODUCTION, $.terser().on('error', e => { console.log(e); })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(`${dist}/assets/js`));
}

// Копирование изображений в папку "dist"
function images() {
  return gulp.src(`${src}/assets/img/**/*`)
    .pipe($.plumber())
    .pipe(gulp.dest(`${dist}/assets/img`));
}

// Запуск сервера с BrowserSync для предварительного просмотра сайта
function server(done) {
  browser.init({
    server: dist, port: 3000
  }, done);
}

// Наблюдение за изменениями статических ресурсов, страниц, Sass и JavaScript
function watch() {
  gulp.watch(assets, copy);
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
  gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sassTask);
  gulp.watch('src/assets/cstm-css/**/*.css').on('all', customCss);
  gulp.watch('src/assets/cstm-js/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}
