'use strict';

/*
This file is part of GitFlowVisualize.

GitFlowVisualize is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

GitFlowVisualize is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with GitFlowVisualize. If not, see <http://www.gnu.org/licenses/>.
*/

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
const karma = require('karma').Server;
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');

// ------------------------------------------------------------------------------------------ Tasks

gulp.task('dist', ['build']);
gulp.task('build', ['stylesheet', 'standalone', 'commonjs', 'bundle']);
gulp.task('test', ['karma']);

// ------------------------------------------------------------------------------------------ Task Definitions

gulp.task('clean', () =>
	gulp.src('dist/*', {read: false})
		.pipe(vinylPaths(del))
)

gulp.task('stylesheet', () => 
	gulp.src('lib/gitflow-visualize.scss')
		.pipe(sass({
			outputStyle: 'nested'
		}))
		.pipe(gulp.dest('dist'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(postcss([
			cssnano({
				safe: true,
				discardUnused: false,
				discardEmpty: false,
				discardDuplicates: false,
				discardComments: { removeAll: true },
				autoprefixer: false
			})
		]))
		.pipe(gulp.dest('dist'))
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
			pattern: '/\\*\\s*inject:<filename>\\*/'
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

gulp.task('karma', ['dist'], (done) => {
	new karma({
		configFile: __dirname + '/test/karma.conf.js',
		singleRun: true
	}, done).start();
})

