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

PATH.css = {
    in  : PATH.source + 'css/**/*.css',
    out : PATH.dest   + 'css/'
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
// SERVER
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



// LESS options
var LESS_PREFIXER = new LessAutoPrefix({
        browsers: ['last 5 versions', 'ie 9', 'Firefox 14']
    });



// NUNJUCKS options
var NUNJUCKS_DEFAULTS = {
    path: 'src/_templates/'
    // envOptions: {
    //     watch: false
    // }
};


// CSS ================================================
//
gulp.task('css', function() {
    // console.log('*************************');
    // console.log('*** Starting CSS task ***');
    // console.log('*************************');

    return gulp.src(PATH.css.in)
        .pipe(gulp.dest(PATH.css.out))
        ;
});

gulp.task('less', function() {
    // console.log('**************************');
    // console.log('*** Starting LESS task ***');
    // console.log('**************************');

    return gulp.src(PATH.less.all)
        .pipe(changed(PATH.less.out))
        .pipe(plumber( function (err) {
            console.log('***********************');
            console.log('*** LESS TASK ERROR ***');
            console.log('***********************');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(less({
            paths   : [PATH.less.in],
            plugins : [LESS_PREFIXER]
        }))
        .pipe(rename('style.css'))
        .pipe(gulpif(argv.prod, cleanCSS()))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATH.less.out))
        .pipe(browsersync.reload({ stream: true }))
        ;
});

gulp.task('styles', ['css', 'less']);


// IMAGES ==============================================
//

gulp.task('images', function() {
    // console.log('****************************');
    // console.log('*** Starting IMAGES task ***');
    // console.log('****************************');

    return gulp.src(PATH.images.in)
        //.pipe(changed(PATH.images.out))
        .pipe(gulpif(argv.prod, imagemin()))
        .pipe(gulp.dest(PATH.images.out))
        ;
});

gulp.task('pictures', ['images']);

// TEMPLATING ==========================================
//

gulp.task('nunjucks', function() {
    // console.log('******************************');
    // console.log('*** Starting NUNJUCKS task ***');
    // console.log('******************************');

    // var stream = gulp.src(PATH.tpl.in)
    return gulp.src(PATH.njk.in)
        .pipe(changed(PATH.njk.out))
        .pipe(nunjucksRender(NUNJUCKS_DEFAULTS))
        .pipe(gulp.dest(PATH.njk.out))
        ;
    // return stream;
});

// handle html
gulp.task('html', ['nunjucks'], function() {
    // console.log('**************************');
    // console.log('*** Starting HTML task ***');
    // console.log('**************************');

    return gulp.src(PATH.html.in)
        .pipe(changed(PATH.html.out))
        .pipe(gulp.dest(PATH.html.out))
        ;
});

// OTHER ===============================================
//
// BUILD
gulp.task('build',

    [   'styles',
        'pictures',
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
gulp.task('default', ['browsersync'], function() {

    // image changes
    gulp.watch(
        [
            PATH.images.in
        ],                     ['pictures']);

    // css changes
    gulp.watch(PATH.css.in,    ['css']);

    // less changes
    gulp.watch(PATH.less.in,   ['less']);

    // nunjucks changes
   // gulp.watch([PATH.njk.njk, PATH.njk.in],   ['nunjucks', browsersync.reload]);

    // html changes
    // gulp.watch(PATH.html.in,   ['html', browsersync.reload]);
    gulp.watch(
        [
            PATH.njk.njk,
            PATH.njk.in
        ],                     ['html', browsersync.reload]);

});
