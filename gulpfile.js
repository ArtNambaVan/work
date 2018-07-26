'use strict';

// GULP================================================
//
const gulp       = require('gulp'),

  // gulp plugins
  less           = require('gulp-less'),
  imagemin       = require('gulp-imagemin'),
  rename         = require('gulp-rename'),
  changed        = require('gulp-changed'),
  plumber        = require('gulp-plumber'),
  sourcemaps     = require('gulp-sourcemaps'),
  nunjucksRender = require('gulp-nunjucks-render'),
  cleanCSS       = require('gulp-clean-css'),
  gulpif         = require('gulp-if'),
  argv           = require('yargs').argv,

  // other plugins
  LessAutoPrefix = require('less-plugin-autoprefix'),
  browsersync    = require('browser-sync'),
  del            = require('del')
;

// PATH CONFIG ========================================
//
let PATH;

PATH = {
  src  : 'src/',
  dest : 'dist/'
};

PATH.images = {
  in  : PATH.src  + 'images/**/*.*',
  out : PATH.dest + 'images/'
};

PATH.less = {
  all : PATH.src  + 'css/main.less',
  in  : PATH.src  + 'css/**/*.less',
  out : PATH.dest + 'css/'
};

PATH.html = {
  in  : PATH.src  + '*.html',
  out : PATH.dest + './'
};

PATH.njk = {
  njk : PATH.src + '_templates/**/*.njk',
  in : PATH.src + '_pages/**/*.njk',
  out : PATH.src
};

// OPTIONS ============================================
//

const SYNC_CONFIG = {
  port   : 3333,
  browser: "chrome",
  server : {
    baseDir : PATH.dest,

    //index : 'promotion-rules.html'
    index : 'index.html'
  },
  open   : true,
  notify : false
};

var LESS_PREFIXER = new LessAutoPrefix({
        browsers: ['last 5 versions', 'ie 9', 'Firefox 14']
    });

var NUNJUCKS_DEFAULTS = {
    path: 'src/_templates/'
};

gulp.task('less', function() {
    return gulp.src(PATH.less.all)
        .pipe(changed(PATH.less.out))
        .pipe(plumber( function (err) {
            console.log('***********************');
            console.log('*** LESS TASK ERROR ***');
            console.log('***********************');
            console.log(err);
            this.emit('end');
        }))
        .pipe(gulpif(argv.prod, sourcemaps.init()))
        .pipe(less({
            paths   : [PATH.less.in],
            plugins : [LESS_PREFIXER]
        }))
        .pipe(rename('style.css'))
        .pipe(gulpif(argv.prod, cleanCSS()))
        .pipe(gulpif(argv.prod, sourcemaps.write()))
        .pipe(gulp.dest(PATH.less.out))
        .pipe(browsersync.reload({ stream: true }))
        ;
});


gulp.task('images', function() {

    return gulp.src(PATH.images.in)
        .pipe(gulpif(argv.prod, imagemin()))
        .pipe(gulp.dest(PATH.images.out))
        ;
});


gulp.task('nunjucks', function() {

    return gulp.src(PATH.njk.in)
        .pipe(changed(PATH.njk.out))
        .pipe(nunjucksRender(NUNJUCKS_DEFAULTS))
        .pipe(gulp.dest(PATH.njk.out))
        ;
});

gulp.task('html', ['nunjucks'], function() {
    return gulp.src(PATH.html.in)
        .pipe(changed(PATH.html.out))
        .pipe(gulp.dest(PATH.html.out))
        ;
});

gulp.task('watcher', function() {
  gulp.watch(PATH.images.in, ['images']);
  gulp.watch(PATH.less.in, ['less']);
  gulp.watch([PATH.njk.njk, PATH.njk.in] ['html', browsersync.reload]);
})


// BUILD
gulp.task('build',

    [   'less',
        'images',
        'html'
    ],

    function() {
        console.log('***************************');
        console.log('*** Starting BUILD task ***');
        console.log('***************************');
    }
);

// CLEAN
gulp.task('clean', function() {
  del(
    [
      PATH.dest + '*'
    ]
  );
});

gulp.task('browsersync', function() {
    browsersync(SYNC_CONFIG);
});





// default task


gulp.task('default', ['browsersync', 'build', 'watcher']);




