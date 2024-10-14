'use strict';

import gulpLoadPlugins from 'gulp-load-plugins';
import yargs from 'yargs';
import browser from 'browser-sync';
import gulp from 'gulp';
import panini from 'panini';
import del from 'del'; // Замена rimraf на del
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import named from 'vinyl-named';
import gulpSass from 'gulp-sass';
import sass from 'sass';
import vinylFtp from 'vinyl-ftp';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Загружаем все Gulp плагины в одну переменную для удобного использования всех плагинов в проекте
const $ = gulpLoadPlugins({ overridePattern: false, pattern: ['*'], rename: { 'gulp-sass': 'sassPlugin' } });
const sassPlugin = gulpSass(sass);

// Загрузка переменных окружения из файла .env
dotenv.config();

// Проверяем наличие флага --production для определения режима сборки (production или development)
const PRODUCTION = !!(yargs.argv.production);

// Определение основных путей для сборки проекта
const dist = 'dist';
const src = 'src';
const assets = ['src/assets/**/*', '!src/assets/{img,js,scss,cstm-css,cstm-js}/**/*'];
const packageJson = JSON.parse(readFileSync('./package.json'));
const projectName = packageJson.name; // Название проекта для использования при деплое

// Основная задача сборки: очистка папки dist, компиляция страниц, JavaScript, изображений, копирование статических файлов, компиляция стилей
gulp.task('build', gulp.series(clean, gulp.parallel(pages, javascript, images, copy), gulp.parallel(sassTask, removeNeedless)));

// Задача по умолчанию: сборка проекта, запуск сервера и отслеживание изменений для автоматической перезагрузки
gulp.task('default', gulp.series('build', server, watch));

// Задача деплоя: загрузка содержимого dist на FTP сервер
gulp.task('deploy', gulp.series('build', deploy));

// Удаление папки dist для очистки старых данных перед новой сборкой
function clean() {
  return del([dist]);
}

// Удаление ненужных файлов после сборки (например, исходных scss файлов)
function removeNeedless() {
  return del([`${dist}/assets/scss`]);
}

// Копирование файлов из папки assets, за исключением img, js, и scss, которые обрабатываются другими задачами
function copy() {
  return gulp.src(assets)
    .pipe(gulp.dest(`${dist}/assets`));
}

// Копирование страниц из src/pages и сборка их с использованием Panini в готовые HTML файлы в папке dist
function pages() {
  return gulp.src(`${src}/pages/**/*.{html,hbs,handlebars}`)
    .pipe($.plumber())
    .pipe(panini({
      root: `${src}/pages/`,
      layouts: `${src}/layouts/`,
      partials: `${src}/partials/`,
      data: `${src}/data/`,
      helpers: `${src}/helpers/`
    }))
    .pipe(gulp.dest(dist));
}

// Перезагрузка Panini для обновления шаблонов и частичных элементов (partials)
function resetPages(done) {
  panini.refresh();
  codeValidation();
  done();
}

// Проверка HTML на наличие ошибок с использованием htmlhint
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

// Компиляция SCSS в CSS и применение дополнительных плагинов (автопрефиксер, PurgeCSS, минификация) в продакшн-режиме
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

// Конфигурация Webpack для компиляции JavaScript файлов
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
};

// Компиляция JavaScript с использованием Webpack и Babel, объединение в один файл. В продакшн-режиме применяется минификация
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

// Копирование изображений из src/assets/img в dist/assets/img без изменений
function images() {
  return gulp.src(`${src}/assets/img/**/*`)
    .pipe($.plumber())
    .pipe(gulp.dest(`${dist}/assets/img`));
}

// Запуск локального сервера с использованием BrowserSync для предварительного просмотра сайта
function server(done) {
  browser.init({
    server: dist, port: 3000
  }, done);
}

// Наблюдение за изменениями файлов в проекте и выполнение соответствующих задач для автоматического обновления сайта
function watch() {
  gulp.watch(assets, copy);
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
  gulp.watch('src/{layouts,partials,helpers,data}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sassTask);
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
  gulp.watch('src/data/**/*.json').on('all', gulp.series(resetPages, pages, browser.reload));
}

// Деплой проекта на FTP сервер
function deploy() {
  const conn = vinylFtp.create({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    parallel: 10,
    log: console.log
  });

  const createProjectFolder = true; // Флаг для включения/выключения создания папки с именем проекта на сервере

  const remotePath = createProjectFolder ? `/${projectName}` : '/';

  return gulp.src(`${dist}/**/*`, { base: dist, buffer: false })
    .pipe($.plumber())
    .pipe(conn.newer(remotePath)) // Только обновленные файлы
    .pipe(conn.dest(remotePath));
}