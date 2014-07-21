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

    		// any tag starting with this prefix will enhance the chance of the commit being on the develop branch
    		developBrancheHintPrefix: "devhint/",
    		// this pattern should match the tags that are given to release commits on master 
    		releaseTagPattern: /refs\/tags\/\d+(\.\d+)*\.0$/,
    		dataCallback: function(done) {
    		    var currUrl = document.location.href;
    		    var result = { branches: {}, tags: {}, commits: [] };
    		    if (currUrl.indexOf("plugins/servlet/git-flow-graph/") > -1) {
    		        var parts = currUrl.split('/');
    		        var project = parts[parts.length - 2];
    		        var repo = parts[parts.length - 1];
    		        $.getJSON(
    		            "/rest/api/1.0/projects/" + project + "/repos/" + repo + "/tags"
    		        ).then(function (d) {
    		        	result.tags = d;
    		        });
    		        $.getJSON(
    		            "/rest/api/1.0/projects/" + project + "/repos/" + repo + "/branches"
    		        ).then(function(d) {
    		        	result.branches = d;
    		        	var toGet = [];
    		        	for (var i = 0; i < d.values.length; i++) {
    		        		var br = d.values[i].id;
    		        		toGet.push(br );
    		        	}
    		        	var completed = 0;
    		        	for (var i = 0; i < toGet.length; i++) {
    		        		var par = { start: 0, limit: 100 };
    		        		var item = toGet[i];
    		        		par.until = item;
    		        		if (par.until == "refs/heads/develop")
    		        			par.limit = 200;
    		        		var url = "/rest/api/1.0/projects/" + project + "/repos/" + repo + "/commits";
    		        		$.getJSON(
													url, par
											).always(function (d, s) {
												if (s == "success") {
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
    		dataProcessed: function (d) { }
    	};

    	var cleanup = function (_data) {
    		var result = {};
    		data = result;
    		result.commits = {};
    		if (!_data.commits || !_data.branches || !_data.tags) {
    			throw "raw data should have a commits, branches and  tags property";
    		}
    		for (var i = 0; i < _data.commits.length; i++) {
    			for (var j = 0; j < _data.commits[i].values.length; j++) {
    				var commit = _data.commits[i].values[j];
    				result.commits[commit.id] = commit;
    			}
    		}
    		for (var id in result.commits) {
    			var commit = result.commits[id];
    			if (!commit.children) commit.children = [];
    			for (var i = commit.parents.length - 1; i >= 0; i--) {
    				var parent = result.commits[commit.parents[i].id];
    				if (parent) {
    					setChildToParent(parent, commit.id);
    				} else {
    					commit.parents.splice(i, 1);
    				}
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
    		result.chronoCommits.sort(function (a, b) { return result.commits[b].authorTimestamp - result.commits[a].authorTimestamp; })
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
    			putCommitInColumn(evenOlder[0].id, 'm', data);
    		}

    	};
    	var isolateDevelop = function () {
    		var head = $.grep(data.branches, function (item) { return (item.id == options.developRef); });
    		if (head.length == 0) return;

    		var versionCommitPath = findDevelopPathFrom(head[0].latestChangeset);
    		for (var i = 0; i < versionCommitPath.length; i++) {
    			putCommitInColumn(versionCommitPath[i], 'd', data);
    		}
    	};
    	var isolateRest = function () {
    		var current = 0;
    		for (var i = 0; i < data.chronoCommits.length; i++) {
    			var commit = data.commits[data.chronoCommits[i]];
    			if (!commit.columns) {
    				var childrenThatAreNotMasterOrDevelopAndWhereThisIsTheFirstParent = $.grep(commit.children, function (childId) {
    					var child = data.commits[childId];
    					var isOnMasterOrDevelop = child.columns && (child.columns[0] == "m" || child.columns[0] == "d");
    					if (isOnMasterOrDevelop) return false;
    					return child.parents[0].id == commit.id;
    				});
    				if (childrenThatAreNotMasterOrDevelopAndWhereThisIsTheFirstParent.length == 0) {
    					// if this commit has a child that is master or develop, but it is not on a column yet, we start a new column
    					putCommitInColumn(commit.id, "c" + current, data);
    					current++;
    				} else {
    					var firstChild = data.commits[childrenThatAreNotMasterOrDevelopAndWhereThisIsTheFirstParent[0]];
    					if (firstChild && firstChild.columns) {
    						putCommitInColumn(commit.id, firstChild.columns[0], data);
    						firstChild._hasColumnChild = true;
    					}
    				}
    			}
    		}
    	};
    	var separateReleaseFeatureBranches = function () {
    		for (var col in data.columns) {
    			var column = data.columns[col];
    			if (col == 'm' || col == 'd') continue;
    			var lastCommit = data.commits[column.commits[0]];
    			if (lastCommit.children.length > 0) {
    				var masterCommits = $.grep(lastCommit.children, function (id) { return data.commits[id].columns[0] == 'm'; });
    				var developCommits = $.grep(lastCommit.children, function (id) { return data.commits[id].columns[0] == 'd'; });
    				if (masterCommits.length > 0) {
    					//release branches are branches that are not master or develop, but their latest commit merges into master
    					column.name = 'r' + column.name.substring(1);
    				} else if (developCommits.length > 0) {
    					// feature branches are branches that eventually merge into develop, not master
    					column.name = 'f' + column.name.substring(1);
    				} else {
    					// so we have a child, but not m or d: probably two branches merged together
    					var firstChild = data.commits[lastCommit.children[0]];
    					column.name = firstChild.id[0] + column.name.substring(1);
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
    	};
    	var combineColumnsOfType = function (type) {
    		var columns = $.map(data.columns, function (v, k) { return v; }).filter(function (v) { return v.name[0] == type });
    		for (var i = 0; i < columns.length; i++) {
    			var column = columns[i];
    			for (var j = 0; j < i; j++) {
    				var earlierColumn = columns[j];
    				var earliestCommitOfFirst = data.commits[earlierColumn.commits[earlierColumn.commits.length - 1]];
    				if (earliestCommitOfFirst.parents.length > 0) {
    				    earliestCommitOfFirst = data.commits[earliestCommitOfFirst.parents[0].id];
    				}
    				// todo: iets doen met deze last child
    				var lastCommitOfSecond = data.commits[column.commits[0]];
    			    if (lastCommitOfSecond.children.length > 0) {
    			        lastCommitOfSecond = data.commits[lastCommitOfSecond.children[0]];
    			    }
    				if (lastCommitOfSecond.orderNr > earliestCommitOfFirst.orderNr) {
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
    		}
    	};
    	var findAllPathsFrom = function (from, blockedNode, onlyMergedTo) {
				var closedPaths = [];
    		var setOfPaths = [];
    		setOfPaths.push([from]);
    		while (true) {
    			var prefix = setOfPaths.shift();
    			var tail = data.commits[prefix[prefix.length - 1]];
    			if (!tail) {
    				return null;
    			}
    			var accessibleParents = tail.parents.filter(function (p) { return !blockedNode(data.commits[p.id], prefix); });
    			if (accessibleParents.length == 0) {
    				closedPaths.push(prefix);
    			}
    			for (var i = 0; i < accessibleParents.length; i++) {
    				if (onlyMergedTo) {
    					// we want to follow only the first parent. We break the loop when i > 0
    					if (i > 0) break;
    				}
    				var parent = data.commits[accessibleParents[i].id];
    				var newPath = prefix.slice(0);
    				newPath.push(parent.id);
    				setOfPaths.push(newPath);
    			}
    			if (setOfPaths.length == 0) break;
    		}
    		return closedPaths;
    	}
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
    		var firstPath = [from];
    		var furthestPath = 0;
    		firstPath.score = 0;
    		openPaths.push(firstPath);
    		while(openPaths.length > 0){
    			var basePath = openPaths.shift();
    			var tail = data.commits[ basePath[basePath.length - 1]];
    			for (var i = 0; i < tail.parents.length; i++) {
    				var nextChild = data.commits[tail.parents[i].id];
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
    		return bestPathToPoints[furthestPath];
    	}
    	var findDevelopPathFrom = function (from) {
    		var score = function (path, nextId) {
    			var c = data.commits[nextId];
    			var last = data.commits[path[path.length - 1]];
    			// no part of m can be d
    			if (c.columns && c.columns[0] == 'm') return false;
    			// next commit cannot have a child further down the line
    			var descendantsInPath = path.filter(function (desc) { return $.inArray(desc, c.children) > -1; });
    			if (descendantsInPath.length != 1) return false;
					// following first parent is a bonus
    			if (last.parents.length > 1 && c.id == last.parents[0].id) return 1;
    			return -1;
    		}
    		var path = findBestPathFromBreadthFirst(from, score);
    		return path;
    	}
    	self.draw = function (elem, opt) {
    		options = $.extend(options, opt);
    		var rawData = options.dataCallback(function (data) {
    			data = cleanup(data);
    			options.dataProcessed(data);
    			if (elem) {
    				self.drawing.drawTable(elem);
    				self.drawing.drawGraph(elem);
    			}
    		});
    	};
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
    			var keysInOrder = $.map(obj, function (v, k) { return k });
    			keysInOrder.sort(function (k1, k2) {
    				var groupVal = function (k) { return { 'm': 1, 'd': 3, 'f': 4, 'r': 2 }[obj[k].name[0]] || 5 };
    				return groupVal(k1) - groupVal(k2);
    			});
    			return keysInOrder
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

    			var cont = d3.select(elem).append("div");
    		    cont.attr("class", "commits-graph-container");
    			var svg = cont.append("svg")
							.attr("width", size.width + 2 * margin)
							.attr("height", size.height + 2 * margin)
							.attr("class", "commits-graph")
						.append("g")
							.attr("transform", "translate(" + margin + "," + margin + ")");

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
    			var connector = function (d) {
    				var childCommit = data.commits[d.c];
    				var parentCommit = data.commits[d.p];
    				var intermediateRow = parentCommit.orderNr - .5;
    				var intermediatCol = childCommit.columns[0];
    				var childCol = data.columns[childCommit.columns[0]];
    				if (!childCol) return null;
    				var precedingCommitOnCol = childCol.commits[$.inArray(childCommit.id, childCol.commits) + 1];
    				if (precedingCommitOnCol) {
    					var precedingPos = data.commits[precedingCommitOnCol].orderNr;
    					if (precedingPos < intermediateRow) {
    					    // worst case: draw diagonal line
    					    intermediateRow = childCommit.orderNr + .5;
    					    var parentCol = data.columns[parentCommit.columns[0]];
    					    if (parentCol) {
    					        var followingCommitOnParent = parentCol.commits[$.inArray(parentCommit.id, parentCol.commits) - 1];
    					        if (!followingCommitOnParent || data.commits[followingCommitOnParent].orderNr < parentCommit.orderNr) {
    					            intermediateRow = childCommit.orderNr + .5;
    					            intermediatCol = parentCommit.columns[0];
    					        }
    					    }
    					}
    				}
    				var points = [
								{ x: childCommit.columns[0], y: childCommit.orderNr },
								{ x: intermediatCol, y: intermediateRow },
								{ x: parentCommit.columns[0], y: parentCommit.orderNr }];
    				return line(points);
    			}

    			// arrows
    			var arrows = $.map(d3.values(data.commits), function (c) { return c.parents.map(function (p) { return { p: p.id, c: c.id }; }) });
    			var arrow = svg.selectAll(".arrow")
							.data(arrows)
							.enter().append("g")
							.attr("class", "arrow");
    			arrow.append("path")
							.attr("d", connector)
							.attr("class", "outline");

    			arrow.append("path")
							.attr("d", connector)
							.attr("class", function (d) { return "branch-type-" + branchType(d.c, d.p); });

    			var branchLine = svg.selectAll(".branch")
						.data(d3.values(data.columns))
						.enter().append("g")
						.attr("class", "branch");
    			branchLine.append("line")
						.attr("class", function (d) { return "branch-line " + d.name; })
						.attr("x1", function (d) { return x(d.id); })
						.attr("x2", function (d) { return x(d.id); })
						.attr("y1", 0)
						.attr("y2", size.height);


    			var commit = svg.selectAll(".commit")
						.data(d3.values(data.commits))
						.enter().append("g")
						.attr("class", "commit");
    			commit.append("circle")
							.attr("class", "commit-dot")
							.attr("r", 5)
							.attr("cx", function (d) { return x(d.columns[0]); })
							.attr("cy", function (d) { return y(d.orderNr); })
							.attr("sha", function (d) { return d.id; })
    			;
    			$('.commit').hover()

    			var messages = d3.select(elem).append("div")
							.attr("class", "messages")

    			//labels
    			var label = messages.selectAll(".tag")
							.data(d3.values(data.commits))
							.enter().append("div")
							.attr("class", "commit-msg")
							.attr("style", function (d) {
								var commit = d;
								return "top:" + y(commit.orderNr) + "px;";
							})
							.html(function (d) {
								var res = d.message;
								if (d.labels) {
									$.each($(d.labels), function (k, v) {
										if (v.indexOf('refs/heads/') == 0) {
											res = "<span class='label branch'>" + v.substring(11) + "</span>" + res;
										}else if (v.indexOf('refs/tags/') == 0) {
											res = "<span class='label tag'>" + v.substring(10) + "</span>" + res;
										} else {
											res = "<span class='label'>" + v + "</span>" + res;
										}
									});
								}
								if (d.author && d.author.displayName) {
									res = "<span class='author' title='" + d.author.displayName + "'>" + d.author.displayName[0] + "</span> " + res;
								}
								return res;
							})

    		};
    		var branchType = function (childId, parentId) {
    			var ct = function (id) {
    				var commit = data.commits[id];
    				var columns = commit.columns.map(function (d) { return data.columns[d]; });
    				if (!columns[0]) return '?';
    				return columns[0].name[0];
    			}
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
    	            'line {stroke:black;opacity: 0.2;}' +
    	            'line.m {stroke:red;stroke-width:3px;opacity: 1;}' +
    	            'line.d {stroke:forestgreen;stroke-width:3px;opacity: 1;}' +
    	            '.arrow path.outline {stroke:white;stroke-width:8px;opacity: .8;}' +
    	            '.arrow path {stroke: black;stroke-width: 3px;opacity: 1;fill:none;}' +
    	            '.arrow path.branch-type-f {stroke: blueviolet;}' +
    	            '.arrow path.branch-type-r {stroke: gold;}' +
    	            '.arrow path.branch-type-m {stroke: gold;}' +
    	            '.arrow path.branch-type-default {stroke-width:1px;}' +
    	            '.commits-graph{}.messages{position:relative;}' +
    	            '.commit-msg{left:300px;position:absolute;white-space:nowrap;}' +
    	            '.commit-msg:hover{background-color:silver;}' +
    	            '.label{border:1px inset;margin-right:2px;}' +
    	            '.branch{background-color:#ffc;border-color:#ff0;}' +
    	            '.tag{background-color:#eee;;border-color:#ccc;}' +
    	            '.author{background-color:orange;border:black 1px solid;margin:2px;}' +
    	            '.commits-graph-container{width:300px;overflow-x:scroll;float:left;}';
    			$('<style>' + style + '</style>').appendTo('head');
    			});
    	}

    	return self;
		})();

