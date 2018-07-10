const gulp = require('gulp');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const path = require('path');
const sass = require( 'gulp-sass' );
const rename = require( 'gulp-rename' );
const jsdoc = require('gulp-jsdoc3');
const webserver = require('gulp-webserver');
const runSequence = require('run-sequence');

const CONFIG = {
    docRoot: './gh-pages/docs/',
    pagesRoot: './gh-pages/',
    testRoot: './test/'
}

gulp.task( 'serve:docs', function() {
    gulp.src( CONFIG.docRoot )
        .pipe( webserver( {
            livereload: true,
            directoryListing: false,
            open: true,
            port: 9001
        } ) );
} );

gulp.task( 'serve:pages', function() {
    gulp.src( CONFIG.pagesRoot )
        .pipe( webserver( {
            livereload: true,
            directoryListing: false,
            open: true,
            port: 9002
        } ) );
} );

gulp.task( 'serve:tests', function() {
    gulp.src( '.' )
        .pipe( webserver( {
            open: 'http://localhost:9003/test/',
            livereload: true,
            directoryListing: false,
            port: 9003,
            fallback: 'index.html'
        } ) );
} );

gulp.task( 'js', function() {
    return gulp.src('./lib/js/Index.js')
      .pipe(webpack( require( './webpack.conf.js' ) ))
      .pipe(gulp.dest('dist/'))
      .pipe(gulp.dest('gh-pages/js/'))
} );

gulp.task( 'sass', function() {
    return gulp.src( './lib/style/style.scss' )
        .pipe( sass() )
        .pipe( rename( 'filter.css' ) )
        .pipe( gulp.dest( 'dist' ) )
        .pipe( gulp.dest( 'gh-pages/styles' ) )
} );

gulp.task( 'docs', function( cb ) {
    gulp.src( [ 'readme.md', './lib/js/**/*.js' ], { read: false } )
        .pipe( jsdoc( require('./jsdoc.conf.js'), cb ) );
} );

gulp.task( 'watch:js', function() {
    gulp.watch( './lib/**/*.js', [ 'js', 'docs' ] );
} );

gulp.task( 'watch:css', function() {
    gulp.watch( './lib/style/**/*.scss', [ 'sass' ] );
} );


gulp.task( 'watch', function() {
    return runSequence( [ 'serve:tests', 'serve:docs', 'serve:pages' ], [ 'watch:js', 'watch:css' ] )
} );

gulp.task( 'default', [ 'js', 'sass', 'docs' ] );
