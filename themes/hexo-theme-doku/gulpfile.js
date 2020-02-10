const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');

const configs = {
    browsers: [
        'last 2 versions',
        'since 2015',
        '> 1%',
        'Chrome >= 49',
        'Firefox >= 44',
        'ie >= 10',
        'Safari >= 9',
    ],
    cleanCSS: {
        compatibility: 'ie10'
    },
};

gulp.task('minify-js', () => gulp.src('src/**/*.js')
    .pipe(uglify({
        keep_fnames: false
    }))
    .pipe(gulp.dest('source')));

gulp.task('minify-css', () => gulp.src('src/**/*.css')
    .pipe(autoprefixer(configs.browsers))
    .pipe(cleanCSS(configs.cleanCSS))
    .pipe(gulp.dest('source')));

gulp.task('build', gulp.parallel('minify-js', 'minify-css'));

gulp.task('default', gulp.parallel('build'));