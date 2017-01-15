'use strict';

// ------------------------------------------------------------------------------------------ Dependencies

const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const injectfile = require("gulp-inject-file");
const del = require('del');
const vinylPaths = require('vinyl-paths');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

// ------------------------------------------------------------------------------------------ Tasks

gulp.task('dist', ['build']);
gulp.task('build', ['standalone', 'commonjs', 'bundle']);

// ------------------------------------------------------------------------------------------ Task Definitions

gulp.task('clean', () =>
	gulp.src('dist/*', {read: false})
		.pipe(vinylPaths(del))
)

gulp.task('standalone', () =>
	gulp.src('lib/gitflow-visualize.js')
		.pipe(gulp.dest('dist'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify({
			dead_code: true,
			drop_debugger: true,
			drop_console: true
		}))
		.pipe(gulp.dest('dist'))
);

gulp.task('commonjs', () =>
	gulp.src('lib/wrapper.js')
		.pipe(injectfile({
			pattern: '<!--\\s*inject:<filename>-->'
		}))
		.pipe(rename({
			basename: 'gitflow-visualize',
			suffix: '.node'
		}))
		.pipe(gulp.dest('dist'))
)

gulp.task('bundle', ['commonjs'], () => 
	browserify({ entries: ['dist/gitflow-visualize.node.js'] })
		.bundle()
		.pipe(source('gitflow-visualize.bundle.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(buffer())
		.pipe(uglify({
			dead_code: true,
			drop_debugger: true,
			drop_console: true
		}))
		.pipe(gulp.dest('dist'))
)

