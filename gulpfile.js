var gulp = require('gulp'),
	webserver = require('gulp-webserver'),
	connect = require('gulp-connect'),
	stripDebug = require('gulp-strip-debug'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	scss = require('gulp-sass'),
	cleanCSS = require('gulp-clean-css');
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

var scssOptions = {
    /**
     * outputStyle (Type : String  , Default : nested)
     * CSS의 컴파일 결과 코드스타일 지정
     * Values : nested, expanded, compact, compressed
     */
    outputStyle : "expanded",

    /**
     * indentType (>= v3.0.0 , Type : String , Default : space)
     * 컴파일 된 CSS의 "들여쓰기" 의 타입
     * Values : space , tab
     */
    indentType : "tab",

    /**
     * indentWidth (>= v3.0.0, Type : Integer , Default : 2)
     * 컴파일 된 CSS의 "들여쓰기" 의 갯수
     */
    indentWidth : 1, // outputStyle 이 nested, expanded 인 경우에 사용

    /**
     * precision (Type :  Integer , Default : 5)
     * 컴파일 된 CSS 의 소수점 자리수.
     */
    precision: 6,

    /**
     * sourceComments (Type : Boolean , Default : false)
     * 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시.
     */
    sourceComments: true
};

gulp.task('tmp:js:minify', function(){
	gulp
		.src(paths.js)
		.pipe(stripDebug())
		.pipe(concat('tmp.combined.js'))
		/*.pipe(uglify())
		.pipe(rename('tmp.combined.min.js'))*/
		.pipe(gulp.dest(tmp+'/js'))
		.pipe(browserSync.reload({stream:true}));
		//.pipe(livereload());
});

// sass 컴파일
gulp.task('tmp:scss', function () {
	var options = {
		cleanCSS: {
			'aggressiveMerging': false, // 속성 병합 false
			'restructuring': false,     // 선택자의 순서 변경 false
			'mediaMerging': false,      // media query 병합 false
		}
	};
	gulp.src(paths.scss)
		.pipe(scss(scssOptions).on('error', scss.logError))
		.pipe(gulp.dest(tmp+ '/css'))
		.pipe(browserSync.reload({stream:true}));

	/*return gulp.src(path.join(tmp+'/css', '*.css'))
			.pipe(cleanCSS(options.cleanCSS))
			.pipe(gulp.dest(tmp+ '/css'))*/
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
		.pipe(stripDebug())
		.pipe(concat('app.combined.js'))
		.pipe(uglify())
		.pipe(rename('app.combined.min.js'))
		.pipe(gulp.dest(dist+'/js'));
});

//scss build
gulp.task('scss:build', function(){
	gulp
		.src(paths.scss)
		.pipe(scss({
				outputStyle: "expanded",
				indentType: 'tab',
				indentWidth: 1
			}).on('error', scss.logError))
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
			index: 'html/index.html'
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
