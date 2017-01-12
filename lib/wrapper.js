'use strict';

// ------------------------------------------------------------------------------------------ Dependencies

const $ = require('jquery');
const d3 = require('d3');
const firstBy = require('thenby');
const md5 = require('crypto-js/md5');
const moment = require('moment');

// ------------------------------------------------------------------------------------------ Wrapper

// CommonJS & AMD wrapper
// Inspiration and code was stolen with gratitude from both the Moment and jQuery projects
// https://github.com/moment/moment/ | http://github.com/jquery
( function( global, factory ) {

    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.GitFlowVisualize = factory()

} )( typeof window !== "undefined" ? window : this, function() {

	// Gitflow-visualize
	<!-- inject: ./gitflow-visualize.js-->

	return GitFlowVisualize;
});
