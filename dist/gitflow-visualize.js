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
var GitFlowVisualize = (function () {

	var self = {};
	var data;
	var displayState = {style:"none", root:null};
	var constants = {
		rowHeight: 35
	};

	var md5 = CryptoJS.MD5;

	var options = {
		drawElem: null,
		drawTable: false,

		// these are the exact names of the branches that should be drawn as stright lines master and develop
		masterRef: "refs/heads/master",
		developRef: "refs/heads/develop",

		// feature branches are prefixed by
		featurePrefix: "refs/heads/feature/",
		releasePrefix: "refs/heads/release/",
		hotfixPrefix: "refs/heads/hotfix/",

		// remaing branches will be tested to this regex: if match -> release, if not -> feature
		releaseZonePattern: /^refs\/heads\/bugfix/,

		// this pattern should match the tags that are given to release commits on master 
		releaseTagPattern: /refs\/tags\/\d+(\.\d+)+$/,

		// UI interaction hooks for loading message
		showSpinner: function () {},
		hideSpinner: function () {},

		// function to provide commit data
		dataCallback: function (done) {
			console.log("The required option 'dataCallback' is missing, please provide a method to retrieve commit data");
			done({});
		},

		// function to retrieve additional commit data on scroll
		moreDataCallback: function (from, done) {
			console.log("The required option 'moreDataCallback' is missing, please provide a method to retrieve commit data");
			done({});
		},

		// function called after data hase been processed successfully and chart has been drawn
		dataProcessed: function (/*data*/) { },

		// function to provide the appropriate url to the actual commit souce
		createCommitUrl: function(/*commit*/){
			return "#";
		},

		// function to provide the appropriate url to the author avatar
		createAuthorAvatarUrl: function(author) {
			return "https://secure.gravatar.com/avatar/" + md5(author.emailAddress) + ".jpg?s=48&amp;d=mm";
		},
		hiddenBranches:[]
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
				delete commit.children;

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
		result.branches = _.filter(_data.branches.values, function(b){return options.hiddenBranches.indexOf(b.id) === -1;});
		for (var i = 0; i < result.branches.length; i++) {
			var branch = result.branches[i];
			var commit = result.commits[branch.latestChangeset];
			if (commit) {
				commit.labels = (commit.labels || []);
				commit.labels.push(branch.id);
			}
		}

		// fixup orderTimestamp for cases of rebasing and cherrypicking, where the parent can be younger than the child
		var fixMyTimeRecursive = function (c, after) {
			if (!c) return;
			if (c.orderTimestamp <= after) {
				//console.log("fixing orderTimestamp for " + c.displayId + " " + c.orderTimestamp + " -> " + after + 1);
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
				if (parent)	fixMyTimeRecursive(me, parent.orderTimestamp);
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
		result.chronoCommits.sort(function (a, b) { return result.commits[b].orderTimestamp - result.commits[a].orderTimestamp; });
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
		var head = _.filter(data.branches, function (item) { return (item.id == options.masterRef); });
		if (head.length == 0) return;
		var versionCommitPath = findShortestPathAlong(
					/*from*/  head[0].latestChangeset,
					/*along*/ _.map(_.filter(data.tags, 
						function (tag) { return tag.id.match(options.releaseTagPattern); }), 
						function (i) { return i.latestChangeset; }),
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
		var head = _.filter(data.branches, function (item) { return (item.id == options.developRef); });
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
				var childrenThatAreNotMasterOrDevelopAndAreLastInTheirColumn = _.filter(commit.children, function (childId) {
					var child = data.commits[childId];
					var isOnMasterOrDevelop = child.columns && (child.columns[0] == "m" || child.columns[0][0] == "d");
					if (isOnMasterOrDevelop) return false;
					if (!data.columns[child.columns[0]]) {
						console.log('huh');
					}
					var commitsInColumn = data.columns[child.columns[0]].commits;
					return child.id == commitsInColumn[commitsInColumn.length - 1];
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
			var allParents = _.flatMap(column.commits, function (id) { return data.commits[id].children; });
			var allParentsOnMaster = _.filter(allParents, function (id) {
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
				var developCommits = _.filter(lastCommit.children, function (id) { return data.commits[id].columns[0][0] == 'd'; });
				if (developCommits.length > 0) {
					// feature branches are branches that eventually merge into develop, not master
					column.name = 'f' + column.name.substring(1);
				} else {
					// so we have a child, but not m or d: probably two branches merged together
					// we'll figure this out later
					column.firstChild = data.commits[lastCommit.children[0]];
				}
			} else {
				// unmerged branch: if starts with featurePrefix -> f
				if (lastCommit.labels && lastCommit.labels.filter(function (l) { return l.indexOf(options.featurePrefix) == 0; }).length > 0) {
					column.name = 'f' + column.name.substring(1);
				}
				// unmerged branch: if starts with releasePrefix or hotfixPrefix -> r
				if (lastCommit.labels && lastCommit.labels.filter(function (l) { 
					return l.indexOf(options.releasePrefix) == 0 
						|| l.indexOf(options.hotfixPrefix) == 0 
						|| options.releaseZonePattern.test(l); 
					}).length > 0) {
					column.name = 'r' + column.name.substring(1);
				}else{
					column.name = 'f' + column.name.substring(1);
				}
			}
		}
		
		var unassignedColumns = _.filter(_.map(Object.keys(data.columns), function (id) { return data.columns[id]; }), function (c) { return c.name[0] == 'c'; });
		while (true) {
			var connected = false;
			for (var j = 0; j < unassignedColumns.length; j++) {
				var column = unassignedColumns[j];
				if (!column.firstChild) continue;
				var childCol = data.columns[column.firstChild.columns[0]];
				var firstLetter = childCol.name[0];
				if (firstLetter == 'c') continue;
				column.name = firstLetter + column.name.substring(1);
				delete column.firstChild;
				connected = true;
			}
			if(!connected)break;
		}

		// now separate the feature branches into groups:
		var featureBranches = _.filter(_.map(Object.keys(data.columns), function (k) { return data.columns[k]; }), function (col) { return (col.name[0] == 'f'); });
		var longBranches = _.filter(featureBranches, function (col) { return col.commits.length > 9 });
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
				if (childColumn.group) thisCol.group = childColumn.group;
			} else {
				var firstCommit = data.commits[thisCol.commits[thisCol.commits.length - 1]];
				if (firstCommit.parents && firstCommit.parents.length > 0) {
					var parentCommit = data.commits[firstCommit.parents[0].id];
					if (parentCommit) {
						var parentCol = data.columns[parentCommit.columns[0]];
						if (parentCol.group) thisCol.group = parentCol.group;
					}
				}
			}
		}
	};

	var combineColumnsOfType = function (type) {
		var columns = _.map(data.columns, function (v /*, k*/) { return v; }).filter(function (v) { return v.name[0] == type });
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
			var columnsToCombine = _.filter(columns, function (c) {
				if (nowGrouping === null) {
					return (typeof c.group === "undefined");
				}
				return c.group == nowGrouping;
			});
			for (var i = 0; i < columnsToCombine.length; i++) {
				var column = columnsToCombine[i];
				for (var j = 0; j < i; j++) {
					var earlierColumn = columnsToCombine[j];
					if (!earlierColumn.isVisible()) {
						continue;
					}
					// todo: here we must also search the columns already mapped to this one
					var earliestCommitOfFirst = earlierColumn.firstRenderedCommit();
					if (earliestCommitOfFirst.parents.length > 0 && data.commits[earliestCommitOfFirst.parents[0].id]) {
						earliestCommitOfFirst = data.commits[earliestCommitOfFirst.parents[0].id];
					}
					var lastCommitOfSecond = column.lastRenderedCommit();
					if (lastCommitOfSecond.children.length > 0 && data.commits[lastCommitOfSecond.children[0]]) {
						lastCommitOfSecond = data.commits[lastCommitOfSecond.children[0]];
					}
					if (lastCommitOfSecond.orderNr >= earliestCommitOfFirst.orderNr) {
						// combine columns
						column.combine(earlierColumn);
						j = i;//next column
					}
				}
			}

		}
	};
	function Column(name){
		var self = this;
		self.id = name;
		self.name = name;
		self.commits = [];
		var renderedOn = null;
		var renderingOthers = [];
		self.combine = function(otherCol){
			renderedOn = otherCol;
			otherCol.receive(self);
		}
		self.receive = function(otherCol){
			renderingOthers.push(otherCol);
		}
		self.isVisible = function(){return renderedOn === null;}
		self.renderPos = function(){return renderedOn ? renderedOn.id : self.id;}
		var allRendered = function(){
			return renderingOthers.concat(self);
		}
		self.firstRenderedCommit = function(){
			if(renderedOn)return null;
			var all = allRendered();
			return all.reduce(function(agg, col){
				var first = data.commits[col.commits[col.commits.length-1]];
				if(!agg || agg.orderNr < first.orderNr)return first;
				return agg;
			}, null);
		}
		self.lastRenderedCommit = function(){
			if(renderedOn)return null;
			var all = allRendered();
			return all.reduce(function(agg, col){
				var last = data.commits[col.commits[0]];
				if(!agg || agg.orderNr > last.orderNr)return last;
				return agg;
			}, null);
		}
	}

	var putCommitInColumn = function (commitId, columnName) {
		if (!data.columns) data.columns = {};
		if (!(columnName in data.columns)) {
			data.columns[columnName] = new Column(columnName );
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
			if (along.indexOf(childId) > -1) return 1000;
			return -1;
		}
		var mostAlong = findBestPathFromBreadthFirst(from, scoreForAlong);
		return mostAlong.asArray();
	}

	function makePath(initialPath) {
		var self = { score: 0 };
		var arrayPath = initialPath.slice(0);
		var length = arrayPath.length;
		var last = arrayPath[length - 1];
		self.members = {};
		var prev = null;
		for (var i = 0; i < arrayPath.length; i++) {
			self.members[arrayPath[i]] = prev;
			prev = arrayPath[i];
		}
		self.push = function (newStep) {
			var currLast = last;
			length++;
			self.members[newStep] = currLast;
			last = newStep;
			arrayPath.push(newStep);
		};

		self.last = function () {
			return last;
		};
		self.clone = function () {
			var clone = makePath(arrayPath);
			clone.score = self.score;
			return clone;
		};
		self.asArray = function () {
			return arrayPath.slice(0);
		};
		return self;
	}

	var findBestPathFromBreadthFirst = function (from, score) {
		var scoreFunc = score || function () { return -1 };
		var openPaths = [];
		var bestPathToPoints = {};
		var fromCommit = data.commits[from];
		var firstPath = makePath([from]);
		var furthestPath = 0;
		firstPath.score = 0;
		bestPathToPoints[fromCommit.orderNr] = firstPath;
		furthestPath = fromCommit.orderNr;
		openPaths.push(firstPath);
		while (openPaths.length > 0) {
			var basePath = openPaths.shift();
			var tail = data.commits[basePath.last()];
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
				var newPath = basePath.clone();
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

	var findDevelopPathFrom = function(from) {
		var developBranch = options.developRef.substring(options.developRef.lastIndexOf('/') + 1);
		var releasePrefix = options.releasePrefix.split('/')[2];
		var hotfixPrefix = options.hotfixPrefix.split('/')[2];
		var regexSelfMerge = new RegExp("Merge branch '(" + developBranch + ")' of http:\\/\\/\\S+ into \\1");
		var regexRealMerge = new RegExp("Merge branch '[^']+' into " + developBranch + "$");
		var regexReleaseMerge = new RegExp("Merge branch '(" + releasePrefix + "|" + hotfixPrefix + ")[^']+' into " + developBranch + "\\b");
		var score = function (path, nextId) {
			var c = data.commits[nextId];
			var last = data.commits[path.last()];
			// no part of m can be d
			if (c.columns && c.columns[0] == 'm') return false;
			// next commit cannot have a child further down the line
			var childrenInPath = c.children.filter(function(child) {
				return child in path.members;
			});
			if (childrenInPath.length != 1) return false;
			// merges of develop onto itself are neutral
			if (regexSelfMerge.test(c.message)) return 0;
			//merges of a release branch onto develop are a big bonus (we want these on the primary develop branch)
			if (regexReleaseMerge.test(c.message)) return 20;
			//merges of a local branch onto develop are a bonus
			if (regexRealMerge.test(c.message)) return 5;
			// following first parent is a bonus
			if (last.parents.length > 1 && c.id == last.parents[0].id) return 1;
			return -.1;
		}
		var path = findBestPathFromBreadthFirst(from, score);
		return path.asArray();
	};

	self.state = function () {
		var state = JSON.stringify(rawData);
		return state;
	};

	var rawData = null;

	self.draw = function (elem, opt) {

		// Check if we have a placeholder element
		if(elem) {
			// Determine if placeholder element was provided
			try {
				//Using W3 DOM2 (works for FF, Opera and Chrom)
				if(!(elem instanceof HTMLElement)) {
					opt = elem;
					elem = null;
				}
			} catch(e) {
				//Browsers not supporting W3 DOM2 don't have HTMLElement and
				//an exception is thrown and we end up here. Testing some
				//properties that all elements have. (works on IE7)
				if(!((typeof elem==="object") &&
				  (elem.nodeType===1) && (typeof elem.style === "object") &&
				  (typeof elem.ownerDocument ==="object"))) {
					opt = elem;
					elem = null;
				}
			}
		}

		// Merge options with defaults
		options = _.extend(options, opt);
		options.drawElem = options.drawElem || elem;

		// Check if we have a placeholder element
		if(!options.drawElem) {
			options.drawElem = d3.select("body").append("div").attr("id", "gitflow-visualize");
		}else{
			if(! (options.drawElem instanceof d3.selection)){
				options.drawElem = d3.select(options.drawElem);
			}
		}

		// Start drawing!
		options.showSpinner();
		options.dataCallback(function (data) {
			rawData = data;
			options.hideSpinner();
			drawFromRaw();
		});
	};

	var appendData = function (newCommits) {
		rawData.commits.push(newCommits);
	}

	var drawFromRaw = function () {
		options.showSpinner();
		data = setTimeout(function () {
			cleanup(rawData);
			options.hideSpinner();
			options.dataProcessed(data);
			if (options.drawElem) {
				self.drawing.drawTable(options.drawElem);
				self.drawing.drawGraph(options.drawElem);
				self.drawing.updateHighlight();
			}
		}, 10);
	}

	self.drawing = (function () {
		var self = {};

		self.updateHighlight = function () {
		  var highlightCommits = function (arrIds) {
			if (!arrIds || arrIds.length == 0) {
			  d3.selectAll(".commit-msg").classed("dim", false).classed("highlight", false);
			  d3.selectAll(".commit-dot").classed("dim", false);
			  d3.selectAll(".arrow").style("opacity", "1");
			  return;
			}
			for (var id in data.commits) {
			  if (arrIds.indexOf(id) > -1) {
				d3.selectAll("#msg-" + id).classed("dim", false).classed("highlight", true);
				d3.selectAll("#commit-" + id).classed("dim", false);
				d3.selectAll(".arrow-to-" + id).style("opacity", "1");
			  } else {
				d3.selectAll("#msg-" + id).classed("dim", true).classed("highlight", false);
				d3.selectAll("#commit-" + id).classed("dim", true);
				d3.selectAll(".arrow-to-" + id).style("opacity", "0.2");

			  }
			}
		  };

		d3.selectAll('.commit-msg.selected').classed("selected", false);

			switch (displayState.style) {
				case "none":
					highlightCommits([]);
					break;
				case "ancestry":
					var root = d3.select("#msg-" + displayState.root);
					var toHighlight = {};
					var addIdsAncestry = function (id) {
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
					root.classed("selected", true);
					addIdsAncestry(displayState.root);
					highlightCommits(Object.keys(toHighlight));
					break;
				default:
			}

		}

		self.drawTable = function (elem) {
			if (options.drawTable) {
				var table = d3.select(document.createElement('table'));
				table.append('tr').html( drawColumnsAsHeaders() + '<td>sha</td><td>parent</td><td>author</td><td>at</td><td>msg</td></tr>');
				for (var i = 0 ; i < data.chronoCommits.length; i++) {
					var commit = data.commits[data.chronoCommits[i]];
					var time = new Date(commit.authorTimestamp);
					table.append('tr').html(drawColumnsAsCells(commit) 
						+ '<td>' + commit.displayId + '</td><td>' + showCommaSeparated(commit.parents) + 
						'</td><td>' + commit.author.name + '</td><td>' + moment(time).format("M/D/YY HH:mm:ss") + 
						'</td><td>' + commit.message + '</td>');
				}
				d3.select(elem).append(table);
			}
		};

		var showCommaSeparated = function (arr) {
			return _.map(arr, function (i) { return i.displayId; }).join(", ");
		}

		var keysInOrder = function (obj) {
			var keys = _.map(obj, function (v, k) { return k; });
			keys.sort(firstBy(function (k1, k2) {
				var groupVal = function (k) { return { 'm': 1, 'd': 3, 'f': 4, 'r': 2 }[obj[k].name[0]] || 5; };
				return groupVal(k1) - groupVal(k2);
			}).thenBy(function (k1, k2) {
				return (data.columns[k1].group || 0) - (data.columns[k2].group || 0);
			}).thenBy(function (k1, k2) {
				if (data.columns[k1].name[0] == 'f') {
					// for feature branches we want the ones with recent commits closer to develop
					var commits1 = data.columns[k1].commits;
					var commits2 = data.columns[k2].commits;
					// order by last commit
					return data.commits[commits1[0]].orderNr - data.commits[commits2[0]].orderNr;
				}
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
				if (commit.columns.indexOf(col) > -1) {
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

		var groupScale = function(cols, maxWidth){
			var scaleCol = {
				gutter: 0.7,
				line: 1,
				developLine: 0.4, 
			};
			var mapping = {};
			var lastGroup = '';
			var here = 0;
			var basePositions = {};
			for (var i = 0; i < cols.length; i++) {
				var thisColId = cols[i];
				var thisCol = data.columns[thisColId];
				if(!thisCol.isVisible()){
					// draws on other column
					mapping[thisColId] = thisCol.renderPos();
					continue;
				}
				var thisGroup = thisColId[0];
				if(lastGroup != thisGroup) here += scaleCol.gutter;
				here += thisGroup == 'd' ? scaleCol.developLine : scaleCol.line;
				basePositions[thisColId] = here;
				lastGroup = thisGroup;
			}

			var baseLinear = d3.scale.linear()
						.domain([0,here])
						.range([0, Math.min(maxWidth, 20 * here)]);
			return function(d){
				if(d in mapping){
					d = mapping[d];
				}
				var offset = 0;
				if(d[d.length-1] == "+"){
					d = d.substring(0, d.length-1);
					offset = 0.5;
				}
				return baseLinear(basePositions[d] + offset);
			};
			
		}

		self.drawGraph = function (elem) {
			var calcHeight = Math.max(800, data.chronoCommits.length * constants.rowHeight);
			var size = { width: 500, height: calcHeight };
			var margin = 20;

			var svg = elem.select("svg>g");
			if (svg.empty()) {
				var cont = elem.append("div");
				cont.attr("class", "commits-graph-container");
				var svg = cont.append("svg")
							.attr("class", "commits-graph")
							.append("g")
							.attr("transform", "translate(" + margin + ",0)");
			}
			elem.select("svg")
				.attr("width", size.width + 2 * margin)
				.attr("height", size.height + 2 * margin);
			var columnsInOrder = keysInOrder(data.columns);

			var legendaBlocks = {
				"master": { prefix: 'm' },
				"releases": { prefix: 'r' },
				"develop": { prefix: 'd' },
				"features": { prefix: 'f' }
			}
			for (var key in legendaBlocks) {
				var groupColumns = columnsInOrder.filter(function (k) { return data.columns[k].name[0] === legendaBlocks[key].prefix; });
				if (groupColumns.length == 0) {
					delete legendaBlocks[key];
					continue;
				}
				legendaBlocks[key].first = groupColumns[0];
				legendaBlocks[key].last = groupColumns[groupColumns.length - 1];
			}
			
			var x = groupScale(columnsInOrder, size.width, data.columnMappings);
			var y = d3.scale.linear()
						.domain([0, data.chronoCommits.length])
						.range([60, 60 + data.chronoCommits.length * constants.rowHeight]);

			var line = d3.svg.line()
						//.interpolate("bundle")
						.x(function (d) { return x(d.x); })
						.y(function (d) { return y(d.y); });

			var connector = function (d) {
				var childCommit = data.commits[d.c];
				var parentCommit = data.commits[d.p];
				if (!childCommit || !parentCommit) return null;
				var intermediateRow = parentCommit.orderNr - .5;
				var intermediatCol = childCommit.columns[0];
				var intermediateRow2 = null;
				var intermediateCol2 = null;
				var childCol = data.columns[childCommit.columns[0]];
				if (!childCol) return null;
				var parentCol = data.columns[parentCommit.columns[0]];
				if (childCol.id != parentCol.id) { // merge
					var followingCommitOnParent = parentCol.commits[parentCol.commits.indexOf(parentCommit.id) - 1];
					if (!followingCommitOnParent || data.commits[followingCommitOnParent].orderNr < childCommit.orderNr) {
						intermediateRow = childCommit.orderNr + .5;
						intermediatCol = parentCommit.columns[0];
					} else {
						var precedingCommitOnChild = childCol.commits[childCol.commits.indexOf(childCommit.id) + 1];
						if (!precedingCommitOnChild || data.commits[precedingCommitOnChild].orderNr > parentCommit.orderNr) {
							// do nothing, the sideways first model of the non-merge commit applies
						} else {
							// worst case: two bends
							intermediateCol2 = childCommit.columns[0] + '+';
							intermediateRow2 = parentCommit.orderNr - 0.5;
							intermediatCol = childCommit.columns[0] + '+';
							intermediateRow = childCommit.orderNr + 0.5;
						}
					}
				}
				if(!intermediateCol2)intermediateCol2 = intermediatCol;
				if(!intermediateRow2)intermediateRow2 = intermediateRow;
				var points = [
					{ x: childCommit.columns[0], y: childCommit.orderNr },
					{ x: intermediatCol, y: intermediateRow },
					{ x: intermediateCol2, y: intermediateRow2 },
					{ x: parentCommit.columns[0], y: parentCommit.orderNr }];
				return line(points);
			};

			// arrows
			svg.selectAll(".arrow").remove();
			var arrows = _.flatMap(d3.values(data.commits), function (c) { return c.parents.map(function (p) { return { p: p.id, c: c.id }; }); });
			var arrow = svg.selectAll(".arrow")
				.data(arrows);
			arrow
				.enter().append("g")
				.attr("class", function (d) { return "arrow arrow-to-" + d.c; });
			arrow
				.append("path")
						.attr("d", connector)
						.attr("class", "outline");

			arrow.append("path")
						.attr("d", connector)
						.attr("class", function (d) { return "branch-type-" + branchType(d.c, d.p); });


			svg.selectAll(".branch").remove();
			var branchLine = svg.selectAll(".branch")
				.data(d3.values(data.columns).filter(function(c){return c.isVisible();}))
				.enter().append("g")
				.attr("class", "branch");
			branchLine
					.append("line")
					.attr("class", function (d) { return "branch-line " + d.name; })
					.attr("x1", function (d) { return x(d.id); })
					.attr("x2", function (d) { return x(d.id); })
					.attr("y1", y(0))
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

			svg.selectAll(".legenda-label").remove();
			var blockLegenda = svg.selectAll(".legenda-label")
				.data(Object.keys(legendaBlocks))
				.enter().append("g")
				.attr("class", function (d) { return "legenda-label " + legendaBlocks[d].prefix; });
			var rotated = blockLegenda.append("g")
				.attr("transform", function (d) {
					var extraOffset = legendaBlocks[d].first == legendaBlocks[d].last ? -10 : 0;
					return "translate(" + (x(legendaBlocks[d].first) + extraOffset) + ", " + (y(0) - 20) + ") rotate(-40)";
				});
			rotated.append("rect")
				.attr("width", 60).attr("height", 15).attr("rx", "2");
			rotated.append("text").attr("y", "12").attr("x", "3")
				.text(function (d) { return d; });
			blockLegenda.append("path").attr("d", function (d) {
				var group = legendaBlocks[d];
				return line([{ x: group.first, y: -.3 }, { x: group.last, y: -.3 }]);
			});

			var messages = elem.select("div.messages");
			if (messages[0][0] == null) {
				messages = elem.append("div")
					.attr("class", "messages");
			}

			//labels
			var labelData = messages.selectAll(".commit-msg")
				.data(d3.values(data.commits), function (c) {
					return c.id + "-" + c.orderNr;
				});
			labelData
				.enter().append("div")
				.attr("class", "commit-msg")
				.attr("id", function (c) { return "msg-" + c.id; })
				.on('click', function (a) {
				  if(d3.event.target.tagName == 'A')return true;
				  if(displayState.style == "ancestry" && a.id == displayState.root){
					displayState.style = "none";
					displayState.root = null;
				  }else{
					displayState.style = "ancestry";
					displayState.root = a.id;
				  }
				  self.updateHighlight();
				});
			labelData.exit().remove();
			labelData
				.attr("style", function (d) {
					var commit = d;
					return "top:" + (y(commit.orderNr) - constants.rowHeight / 2) + "px;";
				})
				.html(function (d) {
					var commitUrl = options.createCommitUrl(d);
					var res = "<table class='commit-table aui'><tr><td class='msg'>";
					if (d.labels) {
						_.each(d.labels, function (v /*, k*/) {
							if (v.indexOf('refs/heads/') == 0) {
								if (v.indexOf(options.masterRef) == 0) {
									res += "<span class='label aui-lozenge aui-lozenge-error aui-lozenge-subtle'>" + v.substring(11) + "</span>";
								} else if (v.indexOf(options.developRef) == 0) {
									res += "<span class='label aui-lozenge aui-lozenge-success aui-lozenge-subtle'>" + v.substring(11) + "</span>";
								} else if (v.indexOf(options.featurePrefix) == 0) {
									res += "<span class='label aui-lozenge aui-lozenge-complete aui-lozenge-subtle'>" + v.substring(11) + "</span>";
								} else if (v.indexOf(options.releasePrefix) == 0 || v.indexOf(options.hotfixPrefix) == 0) {
									res += "<span class='label aui-lozenge aui-lozenge-current aui-lozenge-subtle'>" + v.substring(11) + "</span>";
								} else {
									res += "<span class='label aui-lozenge aui-lozenge-subtle'>" + v.substring(11) + "</span>";
								}
							} else if (v.indexOf('refs/tags/') == 0) {
								res += "<span class='label aui-lozenge aui-lozenge-moved aui-lozenge-subtle'>" + v.substring(10) + "</span>";
							} else {
								res += "<span class='label aui-lozenge aui-lozenge-subtle'>" + v + "</span>";
							}
						});
					}
					res += " " + d.message;
					res += "</td>";
					if (d.author) {
						var authorAvatarUrl = options.createAuthorAvatarUrl(d.author);
						res += "<td class='author'><span class='aui-avatar aui-avatar-xsmall user-avatar'><span class='aui-avatar-inner'><img src='" + authorAvatarUrl + "' width='48px' height='48px' /></span></span>" + (d.author.displayName || d.author.name || d.author.emailAddress) + "</td>";
					} else {
						res += "<td class='author'> </td>";
					}
					if (d.authorTimestamp) {
						var dt = new Date(d.authorTimestamp);
						var today = (new Date().toDateString() === dt.toDateString());
						if (today) {
							res += "<td class='date'>" + moment(dt).format("HH:mm:ss") + " today</td> ";
						} else {
							res += "<td class='date' title='" + moment(dt).format("dddd YYYY-MM-DD HH:mm:ss") + "'>" + moment(dt).format("dd YYYY-MM-DD") + "</td> ";
						}
					}
					res += "<td class='sha'><a class='commit-link' href='" + commitUrl + "' target='_blank'>" + d.displayId + "</a></td> ";
					res += "</tr></table>";
					return res;
				});

			function isElementInViewport(el) {
				var rect = el.getBoundingClientRect();
				return (
								rect.top >= 0 &&
								rect.left >= 0 &&
								rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
								rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
						);
			}

			self.lazyLoad = function() {
				//check for openEnded messages in view
				var keyInView = null;
				for (var key in data.openEnds) {
					var elementSelection = d3.select('#msg-' + key);
					if(!elementSelection.empty()) {
						if (isElementInViewport(elementSelection.node())) {
							keyInView = key;
							break;
						}
					}
				}
				if (keyInView) {
					var ourOrderNr = data.commits[keyInView].orderNr;
					for (var key in data.openEnds) {
						if (data.commits[key].orderNr > ourOrderNr + 200) {
							// to far out, skip
							continue;
						}
						for (var i = 0; i < data.openEnds[key].length; i++) {
							var parentId = data.openEnds[key][i];
							openEndsToBeDownloaded[parentId] = true;
							console.log("scheduled: " + parentId);
						}
						delete data.openEnds[key];
					}
					for (var key in openEndsToBeDownloaded) {
						console.log("downloading: " + key);
						delete openEndsToBeDownloaded[key];
						openEndsBeingDownloaded[key] = true;
						options.moreDataCallback(key, function (commits, thisKey) {
							delete openEndsBeingDownloaded[thisKey];
							if (commits) appendData(commits);
							if (Object.keys(openEndsToBeDownloaded).length == 0 && Object.keys(openEndsBeingDownloaded).length == 0) {
								console.log("queues empty, ready to draw");
								setTimeout(function () {
									drawFromRaw();
								}, 50);
							} else {
								console.log("waiting, still downloads in progress");
								console.log(openEndsToBeDownloaded);
								console.log(openEndsBeingDownloaded);
							}

						});
					}
					openEndsToBeDownloaded = {};
				}
			};
		};

		var openEndsToBeDownloaded = {};
		var openEndsBeingDownloaded = {};
		var branchType = function (childId, parentId) {
			var ct = function (id) {
				var commit = data.commits[id];
				if (!commit || data.columns.length == 0) return "?";
				var columns = commit.columns.map(function (d) { return data.columns[d]; });
				return columns[0].name[0];
			};
			var prioHash = { 'm': 0, 'd': 1, 'r': 3, 'f': 2 };
			var cols = [ct(childId), ct(parentId)];

			// special case for back-merge
			if(cols[0] === 'd' && cols[1] !== 'd')return cols[1] + ' back';
			
			cols.sort(function (v1, v2) { return prioHash[v2] - prioHash[v1]; });
			return cols[0] || "default";
		};

		return self;
	})();

	if (document) {
		d3.select(document).on("scroll resize", function () {
			GitFlowVisualize.drawing.lazyLoad();
		});

		d3.select(document).on("keydown", function () {
			var event = d3.event;
			if (event.ctrlKey && event.shiftKey && event.which == 221) {
				//prompt("Ctrl-C to copy the grap source", GitFlowVisualize.state());
				var out = d3.select("#debug-output");
				if (out.empty()) {
					out = d3.select("body").append("textarea").attr("id", "debug-output");
				}
				out.style("display", "");
				out.node().value = GitFlowVisualize.state();
				out.node().focus();
				out.node().select();
				out.on('blur', function() { out.style("display", "none");; });
			}
		});
	}

	return self;
})();