'use strict';

//gulp allows us to chain together tests and other execution commands for our project
//nodemon allows us to observe changes in a source file and automatically rebuild the project
var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    gutil = require('gulp-util'),
    mocha = require('gulp-mocha');


//the default gulp task simply runs nodemon to watch for changes in app.js
//and restart if any are found. It also watches for any of app.js' dependencies.
gulp.task('default', function() {
    nodemon({
        script: 'server.js',
        ext: 'js html',
        env: {
            DEBUG:['tonksDEV:*'],
            IP:['0.0.0.0'],
            PORT:['8081'],
            MONEYDB_PORT_27017_TCP_ADDR:['172.17.0.2'],
            MONEYDB_PORT_27017_TCP_PORT:['27017']
        },
        ignore: ['./node_modules/**']
    })
    .on('restart', function() {
        console.log('******************************************');
        console.log('Restarting tonksDEV Money nodejs server...');
        console.log('******************************************');
    });
});

// gulp.task('mocha', function() {
//     return gulp.src(['test/*.js'], {read: false})
//             .pipe(mocha({reporter: 'list'}))
//             .on('error', gutil.log);
// });
//
// gulp.task('watch-mocha', function() {
//     gulp.run('mocha');
//     gulp.watch(['./**/*.js', 'test/**/*.js'], ['mocha']);
// });
