const gulp = require('gulp')
const connect = require('gulp-connect')

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')

gulp.task('sass', () => {
  return gulp.src('./sass/*.scss')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./css'))
})

gulp.task('build', ['sass'])

gulp.task('watch', () => {
  gulp.watch('./src/sass/*.scss', ['sass'])
})

gulp.task('default', () => connect.server())
gulp.task('live', ['build', 'watch', 'default'])
