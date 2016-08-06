var gulp  = require('gulp'),
    jshint = require('gulp-jshint'),
    gutil = require('gulp-util');
    

gulp.task('default', ['watch']);

gulp.task('jshint', function() {
  return gulp.src(['*.js', '!*spec.js'])
         .pipe(jshint())
         .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
    gulp.watch(['*.js', '!*spec.js'], ['jshint']);
});
