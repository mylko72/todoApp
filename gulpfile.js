var gulp = require('gulp'),
	webserver = require('gulp-webserver'),
	connect = require('gulp-connect'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	livereload = require('gulp-livereload'),
	browserSync = require('browser-sync').create(),
	path = require('path');

var src = 'public/src',
	dist = 'public/dist',
	tmp = 'public/tmp';

var paths = {
	js: src + '/js/*.js',
	scss: src + '/scss/*.scss',
	html: src + '/html/*',
	img: src + '/img/*',
	font: src + '/fonts/*'

};

gulp.task('tmp:js:minify', function(){
	gulp
		.src(paths.js)
		.pipe(concat('tmp.combined.js'))
		/*.pipe(uglify())
		.pipe(rename('tmp.combined.min.js'))*/
		.pipe(gulp.dest(tmp+'/js'))
		.pipe(browserSync.reload({stream:true}));
		//.pipe(livereload());
});

// sass 컴파일
gulp.task('tmp:scss', function () {
	gulp.src(paths.scss)
		.pipe(sass())
		.pipe(gulp.dest(tmp+ '/css'))
		.pipe(browserSync.reload({stream:true}));
		//.pipe(livereload());
});

//js build
gulp.task('js:build', ['js:minify']);

gulp.task('js:hint', function(){
	gulp
		.src(paths.js)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js:minify', function(){
	gulp
		.src(paths.js)
		.pipe(concat('app.combined.js'))
		.pipe(uglify())
		.pipe(rename('app.combined.min.js'))
		.pipe(gulp.dest(dist+'/js'));
});

//scss build
gulp.task('scss:build', function(){
	gulp
		.src(paths.scss)
		.pipe(sass())
		.pipe(gulp.dest(dist+'/css'));
});

//copy files
gulp.task('copy:build', function(){
	gulp.src(paths.img)
		.pipe(gulp.dest(dist+'/img'))
	gulp.src(paths.html)
		.pipe(gulp.dest(dist+'/html'))
	gulp.src(paths.font)
		.pipe(gulp.dest(dist+'/fonts'));
	gulp.src(src+'/js/lib/*.js')
		.pipe(gulp.dest(dist+'/js/lib'));
	gulp.src(src+'/scss/*.css')
		.pipe(gulp.dest(dist+'/css'));
});

//running webserver after build
gulp.task('server', function(){
	gulp
		.src(dist+'/')
		.pipe(webserver());
});

gulp.task('connect', ['tmp:js:minify', 'tmp:scss'], function(){
	return browserSync.init({
		server : {
			baseDir: [src, tmp],
			browser: "google chrome",
			index: 'html/todo-write.html'
		}
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
	//gulp.watch(src+'/**').on('change', livereload.changed);
});

//default task
gulp.task('default', ['connect',  'watch']);
gulp.task('build', ['js:build',  'scss:build', 'copy:build']);
