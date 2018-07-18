var gulp      = require('gulp'),
  browserSync = require('browser-sync'),
  less        = require('gulp-less')
;

gulp.task('less', function() {

    return gulp.src('src/less/main.less')
        /*.pipe(less().on('error', gutil.log))*/
        .pipe(less())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
                    stream: true
                }));
});

//browserSync settings
gulp.task('browser-sync', function() {
    browserSync({
        browser: "chrome",
        server: {
            baseDir: 'dist'
        },
        notify: false
    });
});

//watch settings
gulp.task('watch', ['browser-sync', 'less'], function() {
    gulp.watch('src/**/*.less', ['less']);
    gulp.watch('dist/*.html', browserSync.reload);
});

gulp.task('default', ['watch']);
