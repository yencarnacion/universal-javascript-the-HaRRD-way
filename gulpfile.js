var gulp = require('gulp');

var browserify = require('browserify');
var babelify = require('babelify');
var lessify = require('lessify');
var nodemon = require('gulp-nodemon');
var sequence = require('run-sequence');
var source = require('vinyl-source-stream');
var insertGlobals = require('insert-module-globals');

gulp.task('default', function(callback) {
   sequence(['compileClient', 'compileServer'], 'start', callback);
});

gulp.task('start', function () {
  nodemon({
    watch: './build',
    script: './build/server.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('compileClient', function () {
  return browserify('./source/index.js')
        .transform('lessify',{})
        .transform('babelify', {presets: ['es2015', 'react']})
        .bundle()
        .pipe(source('tradepr.js'))
        .pipe(gulp.dest('./build/'));
});



gulp.task('compileServer', function () {
  // See https://github.com/substack/node-browserify/issues/1277
  return browserify( ['./source/server/index.js'],
                      {
                        builtins: false,
                        commondir: false,
                        insertGlobalVars: {
                            __filename: insertGlobals.vars.__filename,
                            __dirname: insertGlobals.vars.__dirname,
                            process: function() {
                                return;
                            },
                        },
                        browserField: false,

                      })
        .transform('lessify',{})
        .transform('babelify', {presets: ['es2015', 'react']})
        .bundle()
        .pipe(source('server.js'))
        .pipe(gulp.dest('./build/'));
});


