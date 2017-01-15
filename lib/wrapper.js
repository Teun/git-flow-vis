'use strict';

// ------------------------------------------------------------------------------------------ Dependencies

var jQuery = require('jquery');
var d3 = require('d3');
var firstBy = require('thenby');
var moment = require('moment');
var md5 = require('crypto-js/md5');

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

	var CryptoJS = {
		MD5: md5
	};

	// Gitflow-visualize
	<!-- inject: ./gitflow-visualize.js-->

	return window.GitFlowVisualize = GitFlowVisualize;
});
