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
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "_|d3|firstBy|moment|CryptoJS" }]*/

// ------------------------------------------------------------------------------------------ Dependencies

var d3 = require('d3');
var firstBy = require('thenby');
var moment = require('moment');
var md5 = require('crypto-js/md5');
var forEach = require('lodash/forEach');
var extend = require('lodash/extend');
var filter = require('lodash/filter');
var map = require('lodash/map');
var flatMap = require('lodash/flatmap');
var find = require('lodash/find');
var findLast = require('lodash/findlast');
var memoize = require('lodash/memoize');

// ------------------------------------------------------------------------------------------ Wrapper

// CommonJS & AMD wrapper
// Inspiration and code was stolen with gratitude from both the Moment and jQuery projects
// https://github.com/moment/moment/ | http://github.com/jquery
( function( global, factory ) {

	if(!global.document) {
		throw new Error( "GitFlowVisualize requires a window with a document" );
	} else {
	    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    global.GitFlowVisualize = factory()
	}

} )( typeof window !== "undefined" ? window : this, function() {

	// Creating a cherry-picked version of lodash
	var _ = {
		each: forEach,
		extend: extend,
		filter: filter,
		map: map,
		flatMap: flatMap,
		find: find,
		findLast: findLast,
		memoize: memoize
	}

	// Creating a cherry-picked version of CryptoJS
	var CryptoJS = {
		MD5: md5
	};

	// Gitflow-visualize
	/* inject: ./gitflow-visualize.js*/

	return window.GitFlowVisualize = GitFlowVisualize;
});
