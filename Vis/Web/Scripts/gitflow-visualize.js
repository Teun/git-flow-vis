/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS = CryptoJS || function (s, p) {
	var m = {}, l = m.lib = {}, n = function () { }, r = l.Base = { extend: function (b) { n.prototype = this; var h = new n; b && h.mixIn(b); h.hasOwnProperty("init") || (h.init = function () { h.$super.init.apply(this, arguments) }); h.init.prototype = h; h.$super = this; return h }, create: function () { var b = this.extend(); b.init.apply(b, arguments); return b }, init: function () { }, mixIn: function (b) { for (var h in b) b.hasOwnProperty(h) && (this[h] = b[h]); b.hasOwnProperty("toString") && (this.toString = b.toString) }, clone: function () { return this.init.prototype.extend(this) } },
	q = l.WordArray = r.extend({
		init: function (b, h) { b = this.words = b || []; this.sigBytes = h != p ? h : 4 * b.length }, toString: function (b) { return (b || t).stringify(this) }, concat: function (b) { var h = this.words, a = b.words, j = this.sigBytes; b = b.sigBytes; this.clamp(); if (j % 4) for (var g = 0; g < b; g++) h[j + g >>> 2] |= (a[g >>> 2] >>> 24 - 8 * (g % 4) & 255) << 24 - 8 * ((j + g) % 4); else if (65535 < a.length) for (g = 0; g < b; g += 4) h[j + g >>> 2] = a[g >>> 2]; else h.push.apply(h, a); this.sigBytes += b; return this }, clamp: function () {
			var b = this.words, h = this.sigBytes; b[h >>> 2] &= 4294967295 <<
			32 - 8 * (h % 4); b.length = s.ceil(h / 4)
		}, clone: function () { var b = r.clone.call(this); b.words = this.words.slice(0); return b }, random: function (b) { for (var h = [], a = 0; a < b; a += 4) h.push(4294967296 * s.random() | 0); return new q.init(h, b) }
	}), v = m.enc = {}, t = v.Hex = {
		stringify: function (b) { var a = b.words; b = b.sigBytes; for (var g = [], j = 0; j < b; j++) { var k = a[j >>> 2] >>> 24 - 8 * (j % 4) & 255; g.push((k >>> 4).toString(16)); g.push((k & 15).toString(16)) } return g.join("") }, parse: function (b) {
			for (var a = b.length, g = [], j = 0; j < a; j += 2) g[j >>> 3] |= parseInt(b.substr(j,
			2), 16) << 24 - 4 * (j % 8); return new q.init(g, a / 2)
		}
	}, a = v.Latin1 = { stringify: function (b) { var a = b.words; b = b.sigBytes; for (var g = [], j = 0; j < b; j++) g.push(String.fromCharCode(a[j >>> 2] >>> 24 - 8 * (j % 4) & 255)); return g.join("") }, parse: function (b) { for (var a = b.length, g = [], j = 0; j < a; j++) g[j >>> 2] |= (b.charCodeAt(j) & 255) << 24 - 8 * (j % 4); return new q.init(g, a) } }, u = v.Utf8 = { stringify: function (b) { try { return decodeURIComponent(escape(a.stringify(b))) } catch (g) { throw Error("Malformed UTF-8 data"); } }, parse: function (b) { return a.parse(unescape(encodeURIComponent(b))) } },
	g = l.BufferedBlockAlgorithm = r.extend({
		reset: function () { this._data = new q.init; this._nDataBytes = 0 }, _append: function (b) { "string" == typeof b && (b = u.parse(b)); this._data.concat(b); this._nDataBytes += b.sigBytes }, _process: function (b) { var a = this._data, g = a.words, j = a.sigBytes, k = this.blockSize, m = j / (4 * k), m = b ? s.ceil(m) : s.max((m | 0) - this._minBufferSize, 0); b = m * k; j = s.min(4 * b, j); if (b) { for (var l = 0; l < b; l += k) this._doProcessBlock(g, l); l = g.splice(0, b); a.sigBytes -= j } return new q.init(l, j) }, clone: function () {
			var b = r.clone.call(this);
			b._data = this._data.clone(); return b
		}, _minBufferSize: 0
	}); l.Hasher = g.extend({
		cfg: r.extend(), init: function (b) { this.cfg = this.cfg.extend(b); this.reset() }, reset: function () { g.reset.call(this); this._doReset() }, update: function (b) { this._append(b); this._process(); return this }, finalize: function (b) { b && this._append(b); return this._doFinalize() }, blockSize: 16, _createHelper: function (b) { return function (a, g) { return (new b.init(g)).finalize(a) } }, _createHmacHelper: function (b) {
			return function (a, g) {
				return (new k.HMAC.init(b,
				g)).finalize(a)
			}
		}
	}); var k = m.algo = {}; return m
}(Math);
(function (s) {
	function p(a, k, b, h, l, j, m) { a = a + (k & b | ~k & h) + l + m; return (a << j | a >>> 32 - j) + k } function m(a, k, b, h, l, j, m) { a = a + (k & h | b & ~h) + l + m; return (a << j | a >>> 32 - j) + k } function l(a, k, b, h, l, j, m) { a = a + (k ^ b ^ h) + l + m; return (a << j | a >>> 32 - j) + k } function n(a, k, b, h, l, j, m) { a = a + (b ^ (k | ~h)) + l + m; return (a << j | a >>> 32 - j) + k } for (var r = CryptoJS, q = r.lib, v = q.WordArray, t = q.Hasher, q = r.algo, a = [], u = 0; 64 > u; u++) a[u] = 4294967296 * s.abs(s.sin(u + 1)) | 0; q = q.MD5 = t.extend({
		_doReset: function () { this._hash = new v.init([1732584193, 4023233417, 2562383102, 271733878]) },
		_doProcessBlock: function (g, k) {
			for (var b = 0; 16 > b; b++) { var h = k + b, w = g[h]; g[h] = (w << 8 | w >>> 24) & 16711935 | (w << 24 | w >>> 8) & 4278255360 } var b = this._hash.words, h = g[k + 0], w = g[k + 1], j = g[k + 2], q = g[k + 3], r = g[k + 4], s = g[k + 5], t = g[k + 6], u = g[k + 7], v = g[k + 8], x = g[k + 9], y = g[k + 10], z = g[k + 11], A = g[k + 12], B = g[k + 13], C = g[k + 14], D = g[k + 15], c = b[0], d = b[1], e = b[2], f = b[3], c = p(c, d, e, f, h, 7, a[0]), f = p(f, c, d, e, w, 12, a[1]), e = p(e, f, c, d, j, 17, a[2]), d = p(d, e, f, c, q, 22, a[3]), c = p(c, d, e, f, r, 7, a[4]), f = p(f, c, d, e, s, 12, a[5]), e = p(e, f, c, d, t, 17, a[6]), d = p(d, e, f, c, u, 22, a[7]),
			c = p(c, d, e, f, v, 7, a[8]), f = p(f, c, d, e, x, 12, a[9]), e = p(e, f, c, d, y, 17, a[10]), d = p(d, e, f, c, z, 22, a[11]), c = p(c, d, e, f, A, 7, a[12]), f = p(f, c, d, e, B, 12, a[13]), e = p(e, f, c, d, C, 17, a[14]), d = p(d, e, f, c, D, 22, a[15]), c = m(c, d, e, f, w, 5, a[16]), f = m(f, c, d, e, t, 9, a[17]), e = m(e, f, c, d, z, 14, a[18]), d = m(d, e, f, c, h, 20, a[19]), c = m(c, d, e, f, s, 5, a[20]), f = m(f, c, d, e, y, 9, a[21]), e = m(e, f, c, d, D, 14, a[22]), d = m(d, e, f, c, r, 20, a[23]), c = m(c, d, e, f, x, 5, a[24]), f = m(f, c, d, e, C, 9, a[25]), e = m(e, f, c, d, q, 14, a[26]), d = m(d, e, f, c, v, 20, a[27]), c = m(c, d, e, f, B, 5, a[28]), f = m(f, c,
			d, e, j, 9, a[29]), e = m(e, f, c, d, u, 14, a[30]), d = m(d, e, f, c, A, 20, a[31]), c = l(c, d, e, f, s, 4, a[32]), f = l(f, c, d, e, v, 11, a[33]), e = l(e, f, c, d, z, 16, a[34]), d = l(d, e, f, c, C, 23, a[35]), c = l(c, d, e, f, w, 4, a[36]), f = l(f, c, d, e, r, 11, a[37]), e = l(e, f, c, d, u, 16, a[38]), d = l(d, e, f, c, y, 23, a[39]), c = l(c, d, e, f, B, 4, a[40]), f = l(f, c, d, e, h, 11, a[41]), e = l(e, f, c, d, q, 16, a[42]), d = l(d, e, f, c, t, 23, a[43]), c = l(c, d, e, f, x, 4, a[44]), f = l(f, c, d, e, A, 11, a[45]), e = l(e, f, c, d, D, 16, a[46]), d = l(d, e, f, c, j, 23, a[47]), c = n(c, d, e, f, h, 6, a[48]), f = n(f, c, d, e, u, 10, a[49]), e = n(e, f, c, d,
			C, 15, a[50]), d = n(d, e, f, c, s, 21, a[51]), c = n(c, d, e, f, A, 6, a[52]), f = n(f, c, d, e, q, 10, a[53]), e = n(e, f, c, d, y, 15, a[54]), d = n(d, e, f, c, w, 21, a[55]), c = n(c, d, e, f, v, 6, a[56]), f = n(f, c, d, e, D, 10, a[57]), e = n(e, f, c, d, t, 15, a[58]), d = n(d, e, f, c, B, 21, a[59]), c = n(c, d, e, f, r, 6, a[60]), f = n(f, c, d, e, z, 10, a[61]), e = n(e, f, c, d, j, 15, a[62]), d = n(d, e, f, c, x, 21, a[63]); b[0] = b[0] + c | 0; b[1] = b[1] + d | 0; b[2] = b[2] + e | 0; b[3] = b[3] + f | 0
		}, _doFinalize: function () {
			var a = this._data, k = a.words, b = 8 * this._nDataBytes, h = 8 * a.sigBytes; k[h >>> 5] |= 128 << 24 - h % 32; var l = s.floor(b /
			4294967296); k[(h + 64 >>> 9 << 4) + 15] = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360; k[(h + 64 >>> 9 << 4) + 14] = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360; a.sigBytes = 4 * (k.length + 1); this._process(); a = this._hash; k = a.words; for (b = 0; 4 > b; b++) h = k[b], k[b] = (h << 8 | h >>> 24) & 16711935 | (h << 24 | h >>> 8) & 4278255360; return a
		}, clone: function () { var a = t.clone.call(this); a._hash = this._hash.clone(); return a }
	}); r.MD5 = t._createHelper(q); r.HmacMD5 = t._createHmacHelper(q)
})(Math);
/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
var firstBy = (function () { function e(f) { f.thenBy = t; return f } function t(y, x) { x = this; return e(function (a, b) { return x(a, b) || y(a, b) }) } return e })();
var GitFlowVisualize =
    
		(function () {
    	'use strict';
    	var self = {};
    	var data;
    	var options = {
    		drawTable: false,

    		// these are the exact names of the branches that should be drawn as stright lines master and develop
    		masterRef: "refs/heads/master",
    		developRef: "refs/heads/develop",

    		// feature branches are prefixed by
    		featurePrefix: "refs/heads/feature/",
    		releasePrefix: "refs/heads/release/",
    		hotfixPrefix: "refs/heads/hotfix/",
    		
    	    // url params
    		project:null,
    		repo: null,

    		// any tag starting with this prefix will enhance the chance of the commit being on the develop branch
    		developBrancheHintPrefix: "devhint/",
    		// this pattern should match the tags that are given to release commits on master 
    		releaseTagPattern: /refs\/tags\/\d+(\.\d+)*\.0$/,
    		dataCallback: function(done) {
    		    var currUrl = document.location.pathname;
    		    var result = { branches: {}, tags: {}, commits: [] };
    		    if (currUrl.indexOf("plugins/servlet/git-flow-graph/") > -1) {
    		        var parts = currUrl.split('/');
    		        options.project = options.project || parts[parts.length - 2];
    		        options.repo = options.repo || parts[parts.length - 1];
    		        $.getJSON(
    		            "/rest/api/1.0/projects/" + options.project + "/repos/" + options.repo + "/tags"
    		        ).then(function (d) {
    		        	result.tags = d;
    		        });
    		        $.getJSON(
    		            "/rest/api/1.0/projects/" + options.project + "/repos/" + options.repo + "/branches", { limit: 50 }
    		        ).then(function(d) {
    		        	result.branches = d;
    		        	var toGet = [];
    		        	for (var i = 0; i < d.values.length; i++) {
    		        		var br = d.values[i].id;
    		        		toGet.push(br );
    		        	}
    		        	var completed = 0;
    		        	for (var i = 0; i < toGet.length; i++) {
    		        		var par = { start: 0, limit: 25 };
    		        		var item = toGet[i];
    		        		par.until = item;
    		        	    if (par.until == options.developRef || par.until == options.masterRef) {
    		        	        par.limit = 200;
    		        	    } else {
    		        	        par.since = options.developRef;
    		        	    }
    		        	    var url = "/rest/api/1.0/projects/" + options.project + "/repos/" + options.repo + "/commits";
    		        		$.getJSON(
													url, par
											).always(function (d, s) {
												if (s === "success") {
													result.commits.push(d);
												}
												completed++;
												if (completed >= toGet.length) {
													done(result);
												}
											});
    		        	}
    		        });
    		    } else {
    		        console.log("Current URL doesn't look like my stash page");
    		    }
    		},
    		dataProcessed: function (d) { },
    		moreDataCallback: function(from, done) {
    		    var url = "/rest/api/1.0/projects/" + options.project + "/repos/" + options.repo + "/commit";
    		    $.getJSON(url, { limit: 25, until: from })
    		        .then(function(d) {
    		            done(d);
    		        });

    		}
    	};

    	var cleanup = function (_data) {
    		var result = {};
    		data = result;
    		result.commits = {};
    		result.openEnds = {};
    		if (!_data.commits || !_data.branches || !_data.tags) {
    			throw "raw data should have a commits, branches and  tags property";
    		}
    		for (var i = 0; i < _data.commits.length; i++) {
    			for (var j = 0; j < _data.commits[i].values.length; j++) {
    			    var commit = _data.commits[i].values[j];

    			    // cleanup stuff (when redrawing, this can still be there from last time)
    			    delete commit.columns;
    			    delete commit.labels;
    			    delete commit.orderTimestamp;

    				result.commits[commit.id] = commit;
    			}
    		}
    		for (var id in result.commits) {
    		    var commit = result.commits[id];
    		    commit.orderTimestamp = commit.authorTimestamp;
    			if (!commit.children) commit.children = [];
    			for (var i = commit.parents.length - 1; i >= 0; i--) {
    				var parent = result.commits[commit.parents[i].id];
    				if (parent) {
    					setChildToParent(parent, commit.id);
    				} else {
    					result.openEnds[commit.id] = result.openEnds[commit.id] || [];
    					result.openEnds[commit.id].push(commit.parents[i].id);
    				}
    			}
    		}
    	    
    	    // fixup orderTimestamp for cases of rebasing and cherrypicking, where the parent can be younger than the child
    		var fixMyTimeRecursive = function (c, after) {
    		    if (!c) return;
    		    if (c.orderTimestamp <= after) {
    		    	console.log("fixing orderTimestamp for " + c.displayId + " " + c.orderTimestamp + " -> " + after + 1);
    	            c.orderTimestamp = after + 1;
    	            for (var k = 0; k < c.children.length; k++) {
    	                fixMyTimeRecursive(result.commits[c.children[k]], c.orderTimestamp);
    	            }
    	        }
    	    };
    	    for (var key in result.commits) {
    	        var me = result.commits[key];
    	        for (var k = 0; k < me.parents.length; k++) {
    	            var parent = result.commits[me.parents[k].id];
    	            if (parent)
    	                fixMyTimeRecursive(me, parent.orderTimestamp);
    	        }
    	    }
    	    
    		result.branches = _data.branches.values;
    		for (var i = 0; i < result.branches.length; i++) {
    			var branch = result.branches[i];
    			var commit = result.commits[branch.latestChangeset];
    			if (commit) {
    				commit.labels = (commit.labels || []);
    				commit.labels.push(branch.id);
    			}
    		}
    		result.tags = _data.tags.values;
    		for (var i = 0; i < result.tags.length; i++) {
    			var tag = result.tags[i];
    			var commit = result.commits[tag.latestChangeset];
    			if (commit) {
    				commit.labels = (commit.labels || []);
    				commit.labels.push(tag.id);
    			}
    		}
    		result.labels = result.tags.concat(result.branches);

    		result.chronoCommits = [];
    		for (var id in result.commits) {
    			result.chronoCommits.push(id);
    		}
    	    result.chronoCommits.sort(function(a, b) { return result.commits[b].orderTimestamp - result.commits[a].orderTimestamp; });
    		for (var i = 0; i < result.chronoCommits.length; i++) { result.commits[result.chronoCommits[i]].orderNr = i; }


    		setColumns(result);
    		return result;
    	};
    	var setChildToParent = function (parent, childId) {
    		parent.children = parent.children || [];
    		parent.children.push(childId);
    	};
    	var setColumns = function () {
    		isolateMaster();
    		isolateDevelop();
    		isolateRest();
    		separateReleaseFeatureBranches();
    		combineColumnsOfType('d');
    		combineColumnsOfType('f');
    		combineColumnsOfType('r');
    	};
    	var isolateMaster = function () {
    		var head = $.grep(data.branches, function (item) { return (item.id == options.masterRef); });
    		if (head.length == 0) return;
    		var versionCommitPath = findShortestPathAlong(
						/*from*/  head[0].latestChangeset,
						/*along*/ $.map($.grep(data.tags, function (tag) { return tag.id.match(options.releaseTagPattern); }), function (i) { return i.latestChangeset; }),
						data
						);
    		for (var i = 0; i < versionCommitPath.length; i++) {
    			putCommitInColumn(versionCommitPath[i], 'm', data);
    		}
    		// add older commits that are the 'first' parents of the oldest master commit
    		while (true) {
    			var masterCommits = data.columns['m'].commits;
    			var oldestMaster = masterCommits[masterCommits.length - 1];
    			var evenOlder = data.commits[oldestMaster].parents;
    			if (!evenOlder || evenOlder.length == 0) break;
    			if (!putCommitInColumn(evenOlder[0].id, 'm', data)) {
    				break;
    			}
    		}

    	};
    	var isolateDevelop = function () {
    		var head = $.grep(data.branches, function (item) { return (item.id == options.developRef); });
    		if (head.length == 0) return;

    		var versionCommitPath = findDevelopPathFrom(head[0].latestChangeset);
    		for (var i = 0; i < versionCommitPath.length; i++) {
    			putCommitInColumn(versionCommitPath[i], 'd0', data);
    		}
    	    // find extra develop commits that are on secondary develop columns
    		var developBranch = options.developRef.substring(options.developRef.lastIndexOf('/') + 1);
    		var regexMerge = new RegExp("Merge branch '[^']+' (of \\S+ )?into " + developBranch + "$");
    	    var current = 1;
    	    for (var i = 0; i < data.chronoCommits.length; i++) {
    	        var commit = data.commits[data.chronoCommits[i]];
    	        if (!commit.columns) {
    	            if (regexMerge.test(commit.message)) {
    	                putCommitInColumn(commit.id, 'd' + current);
    	                current++;
    	            }
    	        }
    	    }

    	};
    	var isolateRest = function () {
    		var current = 0;
    		for (var i = 0; i < data.chronoCommits.length; i++) {
    			var commit = data.commits[data.chronoCommits[i]];
    			if (!commit.columns) {
    				var childrenThatAreNotMasterOrDevelopAndAreLastInTheirColumn = $.grep(commit.children, function (childId) {
    					var child = data.commits[childId];
    					var isOnMasterOrDevelop = child.columns && (child.columns[0] == "m" || child.columns[0][0] == "d");
    					if (isOnMasterOrDevelop) return false;
    					if (!data.columns[child.columns[0]]) {
    						console.log('huh');
    					}
    					var commitsInColumn=data.columns[child.columns[0]].commits;
    					return child.id == commitsInColumn[commitsInColumn.length-1];
    				});
    				if (childrenThatAreNotMasterOrDevelopAndAreLastInTheirColumn.length == 0) {
    					// if this commit has a child that is master or develop, but it is not on a column yet, we start a new column
    					putCommitInColumn(commit.id, "c" + current, data);
    					current++;
    				} else {
    					var firstChild = data.commits[childrenThatAreNotMasterOrDevelopAndAreLastInTheirColumn[0]];
    					if (firstChild && firstChild.columns) {
    						putCommitInColumn(commit.id, firstChild.columns[0], data);
    						firstChild._hasColumnChild = true;
    					} else {
    						console.log("Couldn't find appropriate parent");
    					}
    				}
    			}
    		}
    	};
    	var separateReleaseFeatureBranches = function () {
    		for (var col in data.columns) {
    			var column = data.columns[col];
    			if (col == 'm' || col[0] == 'd') continue;
    			var allParents = $.map(column.commits, function (id) { return data.commits[id].children; });
    		    var allParentsOnMaster = $.grep(allParents, function(id) {
    		        var parent = data.commits[id];
    		        return parent.columns && parent.columns[0] == 'm';
    		    });
    		    if (allParentsOnMaster.length > 0) {
    		        //release branches are branches that are not master or develop, but some commit merges into master
    		        column.name = 'r' + column.name.substring(1);
    		        continue;
    		    }
    		    var lastCommit = data.commits[column.commits[0]];
    		    if (lastCommit.children.length > 0) {
    		        var developCommits = $.grep(lastCommit.children, function (id) { return data.commits[id].columns[0][0] == 'd'; });
    		        if (developCommits.length > 0) {
    					// feature branches are branches that eventually merge into develop, not master
    					column.name = 'f' + column.name.substring(1);
    				} else {
    					// so we have a child, but not m or d: probably two branches merged together
    					var firstChild = data.commits[lastCommit.children[0]];
    					var firstLetter = firstChild.columns[0][0];
    					if (firstLetter == 'c') firstLetter = 'f'; //guesss
    					column.name = firstLetter + column.name.substring(1);
    				}
    			} else {
    				// unmerged branch: if starts with featurePrefix -> f
    				if (lastCommit.labels && lastCommit.labels.filter(function (l) { return l.indexOf(options.featurePrefix) == 0; }).length > 0) {
    					column.name = 'f' + column.name.substring(1);
    				}
    				// unmerged branch: if starts with releasePrefix or hotfixPrefix -> r
    				if (lastCommit.labels && lastCommit.labels.filter(function (l) { return l.indexOf(options.releasePrefix) == 0 || l.indexOf(options.hotfixPrefix) == 0; }).length > 0) {
    					column.name = 'r' + column.name.substring(1);
    				}
    			}
    		}
    		// now separate the feature branches into groups:
    		var featureBranches = $.grep($.map(Object.keys(data.columns), function (k) { return data.columns[k];}), function (col) { return (col.name[0] == 'f'); });
    		var longBranches = $.grep(featureBranches, function (col) { return col.commits.length > 9 });
    		var groupNr = 1;
    		for (var i = 0; i < longBranches.length; i++) {
    			var thisCol = longBranches[i];
    			thisCol.group = groupNr;
    			groupNr++;
    		}
    		// now loop through _all_ feature branches and group them together
    		for (var i = 0; i < featureBranches.length; i++) {
    			var thisCol = featureBranches[i];
    			var lastCommit = data.commits[thisCol.commits[0]];
    			if (lastCommit.children && lastCommit.children.length > 0) {
    				var childColumn = data.columns[data.commits[lastCommit.children[0]].columns[0]];
    				if (childColumn.group)
    					thisCol.group = childColumn.group;
    			} else {
    				var firstCommit = data.commits[thisCol.commits[thisCol.commits.length - 1]];
    				if (firstCommit.parents && firstCommit.parents.length > 0) {
    					var parentCommit = data.commits[firstCommit.parents[0].id];
    					if (parentCommit) {
    						var parentCol = data.columns[parentCommit.columns[0]];
    						if (data.columns[parentCommit.columns[0]].group)
    							thisCol.group = data.columns[parentCommit.columns[0]].group;
    					}
    				}
    			}
    		}
    	};
    	var combineColumnsOfType = function (type) {
    		var columns = $.map(data.columns, function (v, k) { return v; }).filter(function (v) { return v.name[0] == type });
    		var groups = {};
    		for (var i = 0; i < columns.length; i++) {
    			if (columns[i].group) {
    				groups[columns[i].group] = true;
    			}
    		}
    		groups = Object.keys(groups);
    		groups.unshift(null);
    		for (var i = 0; i < groups.length; i++) {
    			var nowGrouping = groups[i];
    			var columnsToCombine = $.grep(columns, function (c) {
    				if (nowGrouping === null) {
    					return (typeof c.group === "undefined");
    				}
    				return c.group == nowGrouping;
    			});
    			for (var i = 0; i < columnsToCombine.length; i++) {
    				var column = columnsToCombine[i];
    				for (var j = 0; j < i; j++) {
    					var earlierColumn = columnsToCombine[j];
    					if (!data.columns[earlierColumn.id]) {
    						// this column has already been sweeped away before
    						continue;
    					}
    					var earliestCommitOfFirst = data.commits[earlierColumn.commits[earlierColumn.commits.length - 1]];
    					if (earliestCommitOfFirst.parents.length > 0 && data.commits[earliestCommitOfFirst.parents[0].id]) {
    						earliestCommitOfFirst = data.commits[earliestCommitOfFirst.parents[0].id];
    					}
    					// todo: iets doen met deze last child
    					var lastCommitOfSecond = data.commits[column.commits[0]];
    					if (lastCommitOfSecond.children.length > 0 && data.commits[lastCommitOfSecond.children[0]]) {
    						lastCommitOfSecond = data.commits[lastCommitOfSecond.children[0]];
    					}
    					if (lastCommitOfSecond.orderNr >= earliestCommitOfFirst.orderNr) {
    						// combine columns
    						for (var k = 0; k < column.commits.length; k++) {
    							var commitToMigrate = data.commits[column.commits[k]];
    							commitToMigrate.columns[0] = earlierColumn.id;
    							earlierColumn.commits.push(commitToMigrate.id);
    						}
    						delete data.columns[column.id];
    						j = i;//next column
    					}

    				}
    			}

    		}
    	};

    	var putCommitInColumn = function (commitId, columnName) {
    		if (!data.columns) data.columns = {};
    		if (!(columnName in data.columns)) {
    			data.columns[columnName] = { commits: [], name: columnName, id: columnName };
    		}
    		var commit = data.commits[commitId];
    		if (commit) {
    			commit.columns = commit.columns || [];
    			commit.columns.push(columnName);
    			data.columns[columnName].commits.push(commitId);
    			return true;
    		} else {
    			return false;
    		}
    	};
    	var findShortestPathAlong = function (from, along) {
    		var scoreForAlong = function (path, childId) {
    			if ($.inArray(childId, along) > -1) return 1000;
    			return -1;
    		}
    		var mostAlong = findBestPathFromBreadthFirst(from, scoreForAlong);
    		return mostAlong;
    	}
    	var findBestPathFromBreadthFirst = function (from, score) {
    		var scoreFunc = score || function(){return -1};
    		var openPaths = [];
    		var bestPathToPoints = {};
    		var fromCommit = data.commits[from];
    		var firstPath = [from];
    		var furthestPath = 0;
    		firstPath.score = 0;
    		bestPathToPoints[from.orderNr] = firstPath;
    	    furthestPath = fromCommit.orderNr;
    		openPaths.push(firstPath);
    		while(openPaths.length > 0){
    			var basePath = openPaths.shift();
    			var tail = data.commits[ basePath[basePath.length - 1]];
    			for (var i = 0; i < tail.parents.length; i++) {
    				var nextChild = data.commits[tail.parents[i].id];
    				if (!nextChild) continue;
    				var stepScore = scoreFunc(basePath, nextChild.id);
    				if (stepScore === false) {
    					// blocked node
    					continue;
    				}
    				if (bestPathToPoints[nextChild.orderNr]) {
    					if (bestPathToPoints[nextChild.orderNr].score > basePath.score + stepScore) {
    						// this is not the best path. We do not place it in the open paths
    						continue;
    					}
    				}
    				var newPath = basePath.slice(0);
    				newPath.push(nextChild.id);
    				newPath.score = basePath.score + stepScore;
    				openPaths.push(newPath);
    				bestPathToPoints[nextChild.orderNr] = newPath;
    				if (furthestPath < nextChild.orderNr) furthestPath = nextChild.orderNr;
    			}
    		}
    		var allDistances = Object.keys(bestPathToPoints);
    		allDistances.sort(function (p1, p2) {
    		    if (!p1) return 0;
    		    if (!p2) return 0;
    	        return bestPathToPoints[p2].score - bestPathToPoints[p1].score;
    	    });
    		return bestPathToPoints[allDistances[0]];
    	}
    	var findDevelopPathFrom = function (from) {
    	    var developBranch = options.developRef.substring(options.developRef.lastIndexOf('/') + 1);
    	    var regexSelfMerge = new RegExp("Merge branch '(" + developBranch + ")' of http:\\/\\/\\S+ into \\1");
    	    var regexRealMerge = new RegExp("Merge branch '[^']+' into " + developBranch + "$");
    		var score = function (path, nextId) {
    			var c = data.commits[nextId];
    			var last = data.commits[path[path.length - 1]];
    			// no part of m can be d
    			if (c.columns && c.columns[0] == 'm') return false;
    			// next commit cannot have a child further down the line
    			var descendantsInPath = path.filter(function (desc) { return $.inArray(desc, c.children) > -1; });
    			if (descendantsInPath.length != 1) return false;
    		    // merges of develop onto itself are neutral
    			if (regexSelfMerge.test(c.message))
    			    return 0;
                //merges of a local branch onto develop are a big bonus
    		    if (regexRealMerge.test(c.message))
    		        return 10;
    		    // following first parent is a bonus
    			if (last.parents.length > 1 && c.id == last.parents[0].id) return 1;
    			return 0;
    		}
    		var path = findBestPathFromBreadthFirst(from, score);
    		return path;
    	}

    	var rawData = null;
    	var drawElem = null;
    	self.draw = function (elem, opt) {
    		drawElem = elem;
    		options = $.extend(options, opt);
    		options.dataCallback(function (data) {
    			rawData = data;
    			drawFromRaw();
    		});
    	};
    	var appendData = function (newCommits) {
    		rawData.commits.push(newCommits);
    		drawFromRaw();
    	}
    	var drawFromRaw = function () {
    		data = cleanup(rawData);
    		options.dataProcessed(data);
    		if (drawElem) {
    			self.drawing.drawTable(drawElem);
    			self.drawing.drawGraph(drawElem);
    		}
    	}
    	self.drawing = (function () {
    		var self = {};
    		var panel;
    		self.drawTable = function (elem) {
    			if (options.drawTable) {
    				var table = $('<table/>');
    				table.append('<tr>' + drawColumnsAsHeaders() + '<td>sha</td><td>parent</td><td>author</td><td>at</td><td>msg</td></tr>');
    				for (var i = 0 ; i < data.chronoCommits.length; i++) {
    					var commit = data.commits[data.chronoCommits[i]];
    					var time = new Date(commit.authorTimestamp);
    					table.append('<tr>' + drawColumnsAsCells(commit) + '<td>' + commit.displayId + '</td><td>' + showCommaSeparated(commit.parents) + '</td><td>' + commit.author.name + '</td><td>' + moment(time).format("M/D/YY HH:mm:ss") + '</td><td>' + commit.message + '</td></tr>');
    				}
    				$(elem).append(table);
    			}
    		};

    		var showCommaSeparated = function (arr) {
    			return $.map(arr, function (i) { return i.displayId; }).join(", ");
    		}
    		var keysInOrder = function (obj) {
    			var keys = $.map(obj, function (v, k) { return k; });
    		    keys.sort(firstBy(function(k1, k2) {
    		        var groupVal = function(k) { return { 'm': 1, 'd': 3, 'f': 4, 'r': 2 }[obj[k].name[0]] || 5; };
    		        return groupVal(k1) - groupVal(k2);
    		    }).thenBy(function(k1, k2) {
    		        return (data.columns[k1].group || 0) - (data.columns[k2].group || 0);
    		    }).thenBy(function (k1, k2) {
    		        return k2 > k1 ? -1 : 1;
    		    }));
    		    return keys;
    		};
    		var drawColumnsAsCells = function (commit) {
    			var result = "";
    			var keys = keysInOrder(data.columns);
    			for (var i = 0; i < keys.length; i++) {
    				var col = keys[i];
    				result += "<td>";
    				if ($.inArray(col, commit.columns) > -1) {
    					result += "o";
    				}
    				result += "</td>";
    			}
    			return result;
    		};
    		var drawColumnsAsHeaders = function () {
    			var result = "";
    			var keys = keysInOrder(data.columns);
    			for (var i = 0; i < keys.length; i++) {
    				var col = keys[i];
    				result += "<td>" + data.columns[col].name + "</td>";
    			}
    			return result;
    		};
    		self.drawGraph = function (elem) {
    			var calcHeight = Math.max(800, data.chronoCommits.length * 20);
    			var size = { width: 500, height: calcHeight };
    			var margin = 10;

    			var svg = d3.select(elem).select("svg>g");
    		    if (svg[0][0] == null) {
    		        var cont = d3.select(elem).append("div");
    		        cont.attr("class", "commits-graph-container");
    		        var svg = cont.append("svg")
                                .attr("width", size.width + 2 * margin)
                                .attr("height", size.height + 2 * margin)
                                .attr("class", "commits-graph")
                            .append("g")
                                .attr("transform", "translate(" + margin + "," + margin + ")");
    		    }
    			var columnsInOrder = keysInOrder(data.columns);
    			var x = d3.scale.ordinal()
							.domain(columnsInOrder)
							.rangePoints([0, Math.min(size.width, 20 * columnsInOrder.length)]);
    			var y = d3.scale.linear()
							.domain([0, data.chronoCommits.length])
							.range([10, data.chronoCommits.length * 20]);

    			var line = d3.svg.line()
							//.interpolate("bundle")
							.x(function (d) { return x(d.x); })
							.y(function (d) { return y(d.y); });
    		    var connector = function(d) {
    		        var childCommit = data.commits[d.c];
    		        var parentCommit = data.commits[d.p];
    		        if (!childCommit || !parentCommit) return null;
    		        var intermediateRow = parentCommit.orderNr - .5;
    		        var intermediatCol = childCommit.columns[0];
    		        var childCol = data.columns[childCommit.columns[0]];
    		        if (!childCol) return null;
    		        var parentCol = data.columns[parentCommit.columns[0]];
    		        if (childCommit.parents.length > 1) { // merge
    		            var followingCommitOnParent = parentCol.commits[$.inArray(parentCommit.id, parentCol.commits) - 1];
    		            if (!followingCommitOnParent || data.commits[followingCommitOnParent].orderNr < childCommit.orderNr) {
    		                intermediateRow = childCommit.orderNr + .5;
    		                intermediatCol = parentCommit.columns[0];
    		            } else {
    		                var precedingCommitOnChild = childCol.commits[$.inArray(childCommit.id, childCol.commits) + 1];
    		                if (!precedingCommitOnChild || data.commits[precedingCommitOnChild].orderNr > parentCommit.orderNr) {
    		                    // do nothing, the sideways first model of the non-merge commit applies
    		                } else {
    		                    // worst case: draw diagonal line
    		                    intermediateRow = childCommit.orderNr;
    		                }
    		            }
    		        }
    		        var points = [
    		            { x: childCommit.columns[0], y: childCommit.orderNr },
    		            { x: intermediatCol, y: intermediateRow },
    		            { x: parentCommit.columns[0], y: parentCommit.orderNr }];
    		        return line(points);
    		    };

    		    // arrows
    		    svg.selectAll(".arrow").remove();
    			var arrows = $.map(d3.values(data.commits), function (c) { return c.parents.map(function(p) { return { p: p.id, c: c.id }; }); });
    		    var arrow = svg.selectAll(".arrow")
    		        .data(arrows);
    		    arrow
    		        .enter().append("g")
    		        .attr("class", function(d) { return "arrow arrow-to-" + d.c; });
    		    arrow
    		        .append("path")
							.attr("d", connector)
							.attr("class", "outline");

    			arrow.append("path")
							.attr("d", connector)
							.attr("class", function (d) { return "branch-type-" + branchType(d.c, d.p); });


    			svg.selectAll(".branch").remove();
    		    var branchLine = svg.selectAll(".branch")
    		        .data(d3.values(data.columns))
    		        .enter().append("g")
    		        .attr("class", "branch");
    		    branchLine
    			        .append("line")
						.attr("class", function (d) { return "branch-line " + d.name; })
						.attr("x1", function (d) { return x(d.id); })
						.attr("x2", function (d) { return x(d.id); })
						.attr("y1", 0)
						.attr("y2", size.height);


    		    svg.selectAll(".commit").remove();
    		    var commit = svg.selectAll(".commit")
    		        .data(d3.values(data.commits))
    		        .enter().append("g")
    		        .attr("class", "commit");
    		    commit
    		        .append("circle")
					.attr("class", "commit-dot")
					.attr("r", 5)
					.attr("cx", function (d) { return x(d.columns[0]); })
					.attr("cy", function (d) { return y(d.orderNr); })
					.attr("id", function (d) { return "commit-" + d.id; })
    			;

    			var messages = d3.select(elem).select("div.messages");
    		    if (messages[0][0] == null) {
    		        messages = d3.select(elem).append("div")
                        .attr("class", "messages");
    		    }

    			//labels
    		    var labelData = messages.selectAll(".commit-msg")
    		        .data(d3.values(data.commits), function(c) {
    		             return c.id + "-" + c.orderNr;
    		        });
    		    labelData
    		        .enter().append("div")
    		        .attr("class", "commit-msg")
    		        .attr("id", function(c) { return "msg-" + c.id; })
    		        .on('click', function(a) {
    		            var clicked = $("#msg-" + a.id);
    		            $('.commit-msg.selected').removeClass("selected");
    		            if (clicked.hasClass("highlight")) {
    		                highlightCommits([]);
    		            } else {
    		                var toHighlight = {};
    		                var addIdsAncestry = function(id) {
    		                    var commit = data.commits[id];
    		                    if (!commit) return;
    		                    if (!toHighlight[id]) {
    		                        toHighlight[id] = true;
    		                        for (var i = 0; i < commit.parents.length; i++) {
    		                            addIdsAncestry(commit.parents[i].id);
    		                        }
    		                    } else {
    		                        // prevent cycles
    		                    }
    		                };
    		                clicked.addClass("selected");
    		                addIdsAncestry(a.id);
    		                highlightCommits(Object.keys(toHighlight));
    		            }
    		        });
    		    labelData.exit().remove();
    		    labelData
    		        .attr("style", function(d) {
    		            var commit = d;
    		            return "top:" + y(commit.orderNr) + "px;";
    		        })
    		        .html(function(d) {
    		            var commitUrl = "/projects/" + options.project + "/repos/" + options.repo + "/commits/" + d.id;
    		            var res = "<a class='commit-link' href='" + commitUrl + "' target='_blank'>" + d.displayId + "</a> ";
    		            if (d.author && d.author.name) {
    		                res += "<span class='aui-avatar aui-avatar-small user-avatar'><span class='aui-avatar-inner'><img src='https://secure.gravatar.com/avatar/" + CryptoJS.MD5(d.author.emailAddress) + ".jpg?s=48&amp;d=mm' title='" + (d.author.displayName || d.author.name) + "'/></span></span> ";
    		            }
    		            if (d.authorTimestamp) {
    		                var dt = new Date(d.authorTimestamp);
    		                res += "<span class='date'>" + moment(dt).format("dd YY-MM-DD HH:mm:ss") + "</span> ";
    		            }
    		            if (d.labels) {
    		                $.each($(d.labels), function(k, v) {
    		                    if (v.indexOf('refs/heads/') == 0) {
    		                        res += "<span class='label branch'>" + v.substring(11) + "</span>";
    		                    } else if (v.indexOf('refs/tags/') == 0) {
    		                        res += "<span class='label tag'>" + v.substring(10) + "</span>";
    		                    } else {
    		                        res += "<span class='label'>" + v + "</span>";
    		                    }
    		                });
    		            }
    		            res += d.message;
    		            return res;
    		        });
    		    
    		    function isElementInViewport(el) {
    		    	if (el instanceof jQuery) {el = el[0];}
    		    	var rect = el.getBoundingClientRect();
    		    	return (
									rect.top >= 0 &&
									rect.left >= 0 &&
									rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
									rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
							);
    		    }
    		    $(document).on("scroll resize", function () {
    		    	//check for openEnded messages in view
    		    	for (var key in data.openEnds) {
    		    		if (isElementInViewport($('#msg-' + key))) {
    		    			delete data.openEnds[key];
    		    			options.moreDataCallback(key, function (commits) {
    		    				appendData(commits);
    		    			});
    		    			console.log("now load new commits until " + key + " since develop");
    		    		}
    		    	}
    		    });

    		};
    		var highlightCommits = function (arrIds) {
    		    if (!arrIds || arrIds.length == 0) {
    		        $(".commit-msg").removeClass("dim").removeClass("highlight");
    		        $(".commit-dot").attr("class", "commit-dot");
    		        $(".arrow").css("opacity", "1");
    		        return;
    		    }
    		    for (var id in data.commits) {
    		        if ($.inArray(id, arrIds) > -1) {
    		            $("#msg-" + id).removeClass("dim").addClass("highlight");
    		            $("#commit-" + id).attr("class","commit-dot");
    		            $(".arrow-to-" + id).css("opacity", "1");
    		        } else {
    		            $("#msg-" + id).addClass("dim").removeClass("highlight");
    		            $("#commit-" + id).attr("class", "commit-dot dim");
    		            $(".arrow-to-" + id).css("opacity", "0.2");

                    }
    		    }
    	    };
    		var branchType = function (childId, parentId) {
    		    var ct = function(id) {
    		    	var commit = data.commits[id];
    		    	if (!commit || data.columns.length == 0) return "?";
    					var columns = commit.columns.map(function(d) { return data.columns[d]; });
    					return columns[0].name[0];
    		    };
    			var prioHash = { 'm': 1, 'd': 0, 'r': 2, 'f': 3 };
    			var cols = [ct(childId), ct(parentId)];
    			cols.sort(function (v1, v2) { return prioHash[v2] - prioHash[v1]; });
    			return cols[0] || "default";
    		};
    		return self;


    	})();
    	if (document) {
    	    $(function () {
    	        var style =
    	            'circle.commit-dot {fill: white;stroke:black;stroke-width:2px;}' +
    	            '.commit-dot.dim {opacity:.2;}' +
    	            'line {stroke:black;opacity: 0.2;}' +
    	            'line.m {stroke:#d04437;stroke-width:3px;opacity: 1;}' +
    	            'line.d0 {stroke:#8eb021;stroke-width:3px;opacity: 1;}' +
    	            '.arrow path.outline {stroke:white;stroke-width:4px;opacity: .8;}' +
    	            '.arrow path {stroke: black;stroke-width: 2px;opacity: 1;fill:none;}' +
    	            '.arrow path.branch-type-f {stroke: #3b7fc4;}' +
    	            '.arrow path.branch-type-r {stroke: #f6c342;}' +
    	            '.arrow path.branch-type-d {stroke: #8eb021;}' +
    	            '.arrow path.branch-type-m {stroke: #f6c342;}' +
    	            '.arrow path.branch-type-default {stroke-width:1px;}' +
    	            '.commits-graph{}.messages{position:relative;}' +
    	            '.commit-msg{position:absolute;white-space:nowrap;cursor:pointer;padding-left:30%;width:70%;overflow-x:hidden;}' +
    	            '.commit-msg.dim{color:#aaa;}' +
    	            '.commit-msg.selected{background-color:#ccd9ea;}' +
    	            '.commit-msg:hover{background-color:silver;}' +
    	            '.commit-link{font-family:courier;}' +
    	            '.label{border:1px inset;margin-right:2px;}' +
    	            '.branch{background-color:#ffc;border-color:#ff0;}' +
    	            '.tag{background-color:#eee;;border-color:#ccc;}' +
    	            '.author{background-color:orange;border:black 1px solid;margin:2px;}' +
    	            '.commits-graph-container{width:30%;overflow-x:scroll;float:left;z-index:11;position:relative;}';
    			$('<style>' + style + '</style>').appendTo('head');
    			});
    	}

    	return self;
		})();

