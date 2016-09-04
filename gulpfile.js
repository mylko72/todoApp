var gulp = require('gulp'),
	webserver = require('gulp-webserver'),
	connect = require('gulp-connect'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	livereload = require('gulp-livereload'),
	path = require('path');

var src = 'public/src',
	dist = 'public/dist',
	tmp = 'public/tmp';

var paths = {
	html: src + '/html/*.html',
	js: src + '/js/**/*.js',
	scss: src + '/scss/*.scss'
};

gulp.task('js:minify', function(){
	gulp
		.src(paths.js)
		.pipe(concat('combined.js'))
		.pipe(uglify())
		.pipe(rename('combined.min.js'))
		.pipe(gulp.dest(dist+'/js'));
});

gulp.task('tmp:js:minify', function(){
	gulp
		.src(paths.js)
		.pipe(concat('tmp.combined.js'))
		/*.pipe(uglify())
		.pipe(rename('tmp.combined.min.js'))*/
		.pipe(gulp.dest(tmp+'/js'))
		.pipe(livereload());
});

// sass 컴파일
gulp.task('tmp:scss', function () {
	gulp.src(paths.scss)
		.pipe(sass())
		.pipe(gulp.dest(tmp+ '/css'))
		.pipe(livereload());
});

//js build
gulp.task('js:build', ['js:hint', 'js:minify']);

//scss build
gulp.task('css:build', function(){
	gulp
		.src(path.scss)
		.pipe(sass())
		.pipe(gulp.dest(dist+'/css'));
});

//running webserver
gulp.task('webserver', function(){
	gulp
		.src(src+'/')
		.pipe(webserver({
			livereload: true,
			port: "8080",
			open: '/html/todo-write.html'
			//fallback: src + '/html/todo-write.html'
		}));
});

gulp.task('connect', function(){
	connect.server({
			root: [src, tmp],
			port: 8080,
			livereload: true,
			fallback: src +  '/html/todo-write.html'
		});
});

gulp.task('html', function(){
	gulp.src(src+'/*.html')
		.pipe(livereload({reloadPage:'index.html'}));
});

//watch
gulp.task('watch', function(){
	livereload.listen(4000);
	gulp.watch(paths.html, ['html']);
	gulp.watch(paths.js, ['tmp:js:minify']);
	gulp.watch(paths.scss, ['tmp:scss']);
	gulp.watch(src+'/**').on('change', livereload.changed);
});

//default task
gulp.task('default', ['connect', 'tmp:js:minify', 'tmp:scss', 'watch']);
