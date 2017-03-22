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
	var LOG = {DEBUG: "DEBUG", INFO: "INFO", WARN:"WARN", ERROR:"ERROR"}

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
		releaseTagPattern: /^refs\/tags\/\d+(\.\d+)+$/,

		// UI interaction hooks for loading message
		showSpinner: function () {},
		hideSpinner: function () {},

		// function to provide commit data
		dataCallback: function (done) {
			console.log(LOG.WARN, "The required option 'dataCallback' is missing, please provide a method to retrieve commit data");
			done({});
		},

		// function to retrieve additional commit data on scroll
		moreDataCallback: function (from, done) {
			console.log(LOG.WARN, "The required option 'moreDataCallback' is missing, please provide a method to retrieve commit data");
			done({});
		},

		// function called after data hase been processed successfully and chart has been drawn
		dataProcessed: function (/*data*/) { },

		// function called for debug logging
		log: function(level, message){},

		// function to provide the appropriate url to the actual commit souce
		createCommitUrl: function(/*commit*/){
			return "#";
		},

		// function to provide the appropriate url to the author avatar
		createAuthorAvatarUrl: _.memoize(function(author) {
			return "https://secure.gravatar.com/avatar/" + md5(author.emailAddress) + ".jpg?s=48&amp;d=mm";
		}, function(author){return author.emailAddress;}),
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
		result.hiddenBranches = _.filter(_data.branches.values, function(b){return options.hiddenBranches.indexOf(b.id) > -1;});
		for (var i = 0; i < result.branches.length; i++) {
			var branch = result.branches[i];
			var commit = result.commits[branch.latestChangeset];
			if (commit) {
				commit.labels = (commit.labels || []);
				commit.labels.push(branch.id);
				branch.lastActivity = commit.authorTimestamp;
			}else{
				result.openEnds["asap"] = result.openEnds["asap"] ||[];
				result.openEnds["asap"].push(branch.latestChangeset);
			}
		}

		// fixup orderTimestamp for cases of rebasing and cherrypicking, where the parent can be younger than the child
		var fixMyTimeRecursive = function (c, after) {
			if (!c) return;
			if (c.orderTimestamp <= after) {
				options.log(LOG.DEBUG, "fixing orderTimestamp for " + c.displayId + " " + c.orderTimestamp + " -> " + after + 1);
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
		// evaluate visibility
		result.visibleCommits = [];
		var counter = 0;
		for(var i = 0; i < result.chronoCommits.length; i++){
			var commit = result.commits[result.chronoCommits[i]];
			if(commit.labels && commit.labels.length){
				commit.visible = true;
			}else{
				var visibleChildren = _.filter( 
					_.map(commit.children, function(id){return result.commits[id];}),
					function(child){return child.visible;});
				commit.visible = (visibleChildren.length > 0);
			}
			if(commit.visible){
				commit.orderNr = counter; 
				result.visibleCommits.push(result.chronoCommits[i]);
				counter++;
			}else{
				delete commit.orderNr;
			}
		}

		setColumns(result);

		if(result.openEnds.asap){
			setTimeout(function() {
				self.drawing.lazyLoad();
			}, 1);
		}
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
						options.log(LOG.WARN, 'huh');
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
						options.log(LOG.INFO, "Couldn't find appropriate parent");
					}
				}
			}
		}
	};

	var separateReleaseFeatureBranches = function () {
		// first find all branches that match a release or bugfix and place columns in appropriate zone
		for(var br = 0; br< data.branches.length; br++){
			var branch = data.branches[br];
			if(branch.id.indexOf(options.releasePrefix) === 0 
				|| branch.id.indexOf(options.hotfixPrefix) === 0
				|| branch.id.match(options.releaseZonePattern) === 0){
					var head = data.commits[branch.latestChangeset];
					if(head){
						var column = data.columns[head.columns[0]];
						if(column.name[0] === 'c'){
							column.name = 'r' + column.name.substring(1);
						}
					} 
				}
		}

		// then do same with features for unplaced
		for(var br = 0; br< data.branches.length; br++){
			var branch = data.branches[br];
			if(branch.id.indexOf(options.featurePrefix) === 0 ){
					var head = data.commits[branch.latestChangeset];
					if(head){
						var column = data.columns[head.columns[0]];
						if(column.name[0] === 'c'){
							column.name = 'f' + column.name.substring(1);
						}
					} 
				}
		}

		// then start looking for topology hints
		for (var col in data.columns) {
			var column = data.columns[col];
			if (col == 'm' || col[0] == 'd' || col[0] == 'r') continue;
			var allChildren = _.flatMap(column.commits, function (id) { return data.commits[id].children; });
			var allChildrenOnMaster = _.filter(allChildren, function (id) {
				var child = data.commits[id];
				return child.visible && child.columns && child.columns[0] == 'm';
			});
			if (allChildrenOnMaster.length > 0) {
				//release branches are branches that are not master or develop, but some commit merges into master
				column.name = 'r' + column.name.substring(1);
				continue;
			}

			var allParents = _.flatMap(column.commits, function (id) { return data.commits[id].parents; });
			var allParentsOnMaster = _.filter(allParents, function (p) {
				var parent = data.commits[p.id];
				if(!parent)return false;
				return parent.visible && parent.columns && parent.columns[0] == 'm';
			});
			if (allParentsOnMaster.length > 0) {
				//release branches are branches that are not master or develop, but some commit merges into master
				column.name = 'r' + column.name.substring(1);
				continue;
			}

			var lastVisibleCommit = column.lastVisible(); // data.commits[column.commits[0]];
			if(!lastVisibleCommit){
				continue;
			}
			// if starts with releasePrefix or hotfixPrefix -> r
			if (lastVisibleCommit.labels && lastVisibleCommit.labels.filter(function (l) { 
				return l.indexOf(options.releasePrefix) == 0 
					|| l.indexOf(options.hotfixPrefix) == 0 
					|| options.releaseZonePattern.test(l); 
				}).length > 0) {
				column.name = 'r' + column.name.substring(1);
				continue;
			}
			if (lastVisibleCommit.labels && lastVisibleCommit.labels.filter(function (l) { return l.indexOf(options.featurePrefix) == 0; }).length > 0) {
				column.name = 'f' + column.name.substring(1);
				continue;
			}
		}
		
		while (true) {
			var connected = false;
			var unassignedColumns = _.filter(_.map(Object.keys(data.columns), function (id) { return data.columns[id]; }), function (c) { return c.name[0] == 'c'; });
			for (var j = 0; j < unassignedColumns.length; j++) {
				var column = unassignedColumns[j];
				var childCol = column.finallyMergesToColumn();
				var firstLetter = childCol ? childCol.name[0]: 'f';
				if (firstLetter == 'c') continue;
				if (firstLetter == 'd') firstLetter = 'f';
				column.name = firstLetter + column.name.substring(1);
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
			var lastVisibleCommit = data.commits[thisCol.commits[0]];
			if (lastVisibleCommit.children && lastVisibleCommit.children.length > 0) {
				var childColumn = data.columns[data.commits[lastVisibleCommit.children[0]].columns[0]];
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
		for (var groupCount = 0; groupCount < groups.length; groupCount++) {
			var nowGrouping = groups[groupCount];
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
					if (earliestCommitOfFirst && earliestCommitOfFirst.parents.length > 0 && data.commits[earliestCommitOfFirst.parents[0].id]) {
						earliestCommitOfFirst = data.commits[earliestCommitOfFirst.parents[0].id];
					}
					var lastCommitOfSecond = column.lastRenderedCommit();
					if (lastCommitOfSecond && lastCommitOfSecond.children.length > 0 && data.commits[lastCommitOfSecond.children[0]]) {
						lastCommitOfSecond = data.commits[lastCommitOfSecond.children[0]];
					}
					if ((!lastCommitOfSecond) || (!earliestCommitOfFirst) || lastCommitOfSecond.orderNr >= earliestCommitOfFirst.orderNr) {
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
		var visibleCommit = function(id){
			var commit = data.commits[id];
			return commit && commit.visible === true
		}
		self.firstVisible = function(){
			var id = _.findLast(self.commits, visibleCommit);
			return data.commits[id];
		}
		self.lastVisible = function(){
			var id = _.find(self.commits, visibleCommit);
			return data.commits[id];
		}
		self.firstRenderedCommit = function(){
			if(renderedOn)return null;
			var all = allRendered();
			return all.reduce(function(agg, col){
				var first = col.firstVisible();
				if(first && (!agg || agg.orderNr < first.orderNr))return first;
				return agg;
			}, null);
		}
		self.lastRenderedCommit = function(){
			if(renderedOn)return null;
			var all = allRendered();
			return all.reduce(function(agg, col){
				var last = col.lastVisible();
				if(!agg || agg.orderNr > last.orderNr)return last;
				return agg;
			}, null);
		}
		self.finallyMergesToColumn = function(){
			var lastCommit = this.lastVisible();
			if(!lastCommit)return null;
			var childrenOfLast = lastCommit.children;
			if(childrenOfLast.length === 0)return null;
			var childCol = data.columns[data.commits[childrenOfLast[0]].columns[0]];
			return childCol;
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

	var NullPath = {
		length:function(){return 0;},
		score:function(){return 0;},
		asArray:function(){return [];},
		contains:function(){return false;},
		members: {}
	};
	function ImmutablePath(parentPath, nextStep) {
		var self = this;
		parentPath = parentPath || NullPath;
		var length = parentPath.length() + 1;
		var stepScore = 0;
		self.setStepScore = function(value){stepScore = value;}
		self.members = {};
		self.members.prototype = parentPath.members;
		self.members[nextStep] = true;
		
		self.last = function () {return nextStep;};
		var parentScore = null;
		self.score = function(){
			if(parentScore === null){
				parentScore = parentPath.score();
			}
			return parentScore + stepScore;
		}
		self.length = function(){return length;}
		self.asArray = function () {
			var arr = parentPath.asArray().slice(0);
			arr.push(nextStep);
			return arr;
		};
		self.contains = function(id){
			// if(id === nextStep)return true;
			// return parentPath.contains(id);
			return (id in self.members);
		}
		return self;
	}

	var findBestPathFromBreadthFirst = function (from, score) {
		var scoreFunc = score || function () { return -1 };
		var openPaths = [];
		var bestPathToPoints = {};
		var fromCommit = data.commits[from];
		var firstPath = new ImmutablePath(null, from);
		var furthestPath = 0;
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
					if (bestPathToPoints[nextChild.orderNr].score() > basePath.score() + stepScore) {
						// this is not the best path. We do not place it in the open paths
						continue;
					}
				}
				var newPath = new ImmutablePath(basePath, nextChild.id);
				newPath.setStepScore(stepScore);
				openPaths.push(newPath);
				bestPathToPoints[nextChild.orderNr] = newPath;
				if (furthestPath < nextChild.orderNr) furthestPath = nextChild.orderNr;
			}
		}
		var allDistances = Object.keys(bestPathToPoints);
		allDistances.sort(function (p1, p2) {
			if (!p1) return 0;
			if (!p2) return 0;
			return bestPathToPoints[p2].score() - bestPathToPoints[p1].score();
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
				return path.contains(child);
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
	var downloadedStartPoints = [];

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
	var updateBranches = function(branches){
		// existing branches will only get their latestworkset updated, new braches will be added.
		// no deletes (for now)
		var existingBranches = rawData.branches.values.reduce(function(a, v){
			a[v.id] = v;
			return a;
		},{});
		var changes = false;
		branches.values.forEach(function(b){
			var ref = b.id;
			if(ref in existingBranches){
				if(existingBranches[ref].latestChangeset !== b.latestChangeset){
					changes = true;
					existingBranches[ref].latestChangeset = b.latestChangeset;
				}
			}else{
				rawData.branches.values.push(b);
				changes = true;
			}
		});
		return changes;
	}

	var drawFromRaw = function () {
		options.showSpinner();
		data = setTimeout(function () {
			options.log(LOG.INFO, "Starting full new draw");
			cleanup(rawData);
			options.log(LOG.INFO, "Done cleaning/transforming data");
			options.hideSpinner();
			options.dataProcessed(data);
			if (options.drawElem) {
				self.drawing.drawTable(options.drawElem);
				self.drawing.drawGraph(options.drawElem);
				self.drawing.updateHighlight();
			}
			options.log(LOG.INFO, "Done drawing (animations still in progress)");
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
				var offset = 0;
				if(d[d.length-1] == "+"){
					d = d.substring(0, d.length-1);
					offset = 0.5;
				}
				if(d in mapping){
					d = mapping[d];
				}
				return baseLinear(basePositions[d] + offset);
			};
			
		}

		self.drawGraph = function (elem) {
			var calcHeight = Math.max(800, data.visibleCommits.length * constants.rowHeight);
			var size = { width: 500, height: calcHeight };
			var margin = 20;

			var svg = elem.select("svg>g");
			if (svg.empty()) {
				var cont = elem.append("div");
				cont.attr("class", "commits-graph-container");
				cont.append("div")
					.attr("class", "scroll-container")
					.append("div")
					.attr("class", "scrollme");
				var svg = cont.append("svg")
							.attr("class", "commits-graph")
							.append("g")
							.attr("transform", "translate(" + margin + ",0)");
				var backgroundLayer = svg.append("g").attr("id", "bgLayer");
				var arrowsLayer = svg.append("g").attr("id", "arrowsLayer");
				var mainLinesLayer = svg.append("g").attr("id", "mainLinesLayer");
				var commitsLayer = svg.append("g").attr("id", "commitsLayer");
			}

			elem.select("svg")
				.attr("width", size.width + 2 * margin)
				.attr("height", size.height + 2 * margin);
			elem.select("div.scrollme").style("width", size.width + 2 * margin + "px");
			
			var scroll1 = elem.select(".commits-graph-container");
			var scroll2 = elem.select(".scroll-container");
			scroll1.on("scroll", function(){scroll2.node().scrollLeft = scroll1.node().scrollLeft;});
			scroll2.on("scroll", function(){scroll1.node().scrollLeft = scroll2.node().scrollLeft;});

			backgroundLayer = svg.select("g#bgLayer");
			arrowsLayer = svg.select("g#arrowsLayer");
			mainLinesLayer = svg.select("g#mainLinesLayer");
			commitsLayer = svg.select("g#commitsLayer");

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
						.domain([0, data.visibleCommits.length])
						.range([60, 60 + data.visibleCommits.length * constants.rowHeight]);

			var line = d3.svg.line()
						//.interpolate("bundle")
						.x(function (d) { return x(d.x); })
						.y(function (d) { return y(d.y); });

			var connector = function (d) {
				var childCommit = data.commits[d.c];
				var parentCommit = data.commits[d.p];
				if (!childCommit || !parentCommit || !childCommit.visible) return null;
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
			var arrows = _.flatMap(
				d3.values(data.commits).filter(function(c){return c.visible;})
				, function (c) { 
					return c.parents.map(function (p) { return { p: p.id, c: c.id }; }); 
				});
			var arrow = arrowsLayer.selectAll(".arrow")
				.data(arrows, function(d){return 'a-' + d.p + '-' + d.c;});
			var addedArrow = arrow
				.enter().append("g")
				.attr("class", function (d) { return "arrow arrow-to-" + d.c; });
			addedArrow
				.append("path")
					.attr("stroke-linejoin", "round")
					.attr("class", "outline");
			addedArrow
				.append("path")
					.attr("stroke-linejoin", "round")
					.attr("class", function (d) { return "branch-type-" + branchType(d.c, d.p); });

			var path = arrow.selectAll("g>path");			
			path.transition().attr("d", connector)

			arrow.exit().remove();


			var branchLine = backgroundLayer.selectAll(".branch")
				.data(d3.values(data.columns).filter(function(c){return c.isVisible();}));
			branchLine
				.enter().append("g")
				.attr("class", "branch")
				.append("line");
			branchLine.select("g>line").transition()
					.attr("class", function (d) { return "branch-line " + d.name; })
					.attr("x1", function (d) { return x(d.id); })
					.attr("x2", function (d) { return x(d.id); })
					.attr("y1", y(0))
					.attr("y2", size.height);
			branchLine.exit().remove();

			var branchLine = mainLinesLayer.selectAll(".branch")
				.data(d3.values(data.columns).filter(function(c){return c.isVisible() && (c.id === "d0" || c.id === "m");}));
			branchLine
				.enter().append("g")
				.attr("class", "branch")
				.append("line");
			branchLine.select("g>line").transition()
					.attr("class", function (d) { return "branch-line " + d.name; })
					.attr("x1", function (d) { return x(d.id); })
					.attr("x2", function (d) { return x(d.id); })
					.attr("y1", y(0))
					.attr("y2", size.height);

			var commit = commitsLayer.selectAll(".commit")
				.data(d3.values(data.commits).filter(function(c){return c.visible;}), function(c){return 'c-' + c.id;});
			commit
				.enter().append("g")
				.attr("class", "commit")
				.append("circle")
				.attr("class", "commit-dot")
				.attr("r", 5);
			
			commit.exit().remove();
			commit
				.transition()
				.select("g>circle")
				.attr("cx", function (d) { return x(d.columns[0]); })
				.attr("cy", function (d) { return y(d.orderNr); })
				.attr("id", function (d) { return "commit-" + d.id; });

			var blockLegenda = backgroundLayer.selectAll(".legenda-label")
				.data(Object.keys(legendaBlocks));
			var entering = blockLegenda.enter();
			var rotated = entering
				.append("g")
					.attr("class", function (d) { return "legenda-label " + legendaBlocks[d].prefix; })
				.append("g")					
					.attr("transform", function (d) {
						var extraOffset = legendaBlocks[d].first == legendaBlocks[d].last ? -10 : 0;
						return "translate(" + (x(legendaBlocks[d].first) + extraOffset) + ", " + (y(0) - 20) + ") rotate(-40)";
					});
			rotated.append("rect")
				.attr("width", 60).attr("height", 15).attr("rx", "2");
			rotated.append("text").attr("y", "12").attr("x", "3")
				.text(function (d) { return d; });
			
			blockLegenda
				.select("g").transition()
					.attr("transform", function (d) {
						var extraOffset = legendaBlocks[d].first == legendaBlocks[d].last ? -10 : 0;
						return "translate(" + (x(legendaBlocks[d].first) + extraOffset) + ", " + (y(0) - 20) + ") rotate(-40)";
					});

			var messages = elem.select("div.messages");
			if (messages.empty()) {
				messages = elem.append("div")
					.attr("class", "messages");
				messages
					.append("div").attr("class", "context-menu");
			}
			var gutter = elem.select("div.gutter");
			if (gutter.empty()) {
				gutter = elem.append("div")
					.attr("class", "gutter");
				gutter.append("div").attr("class", "gutterline");

				var dragging = false;
				var dragStart = 0;
				var dragStartLeft = null;
				gutter.on("mousedown", function(){
					if(!dragging){
						dragging = true;
						dragStart = d3.event.pageX;
						dragStartLeft = gutter.style("margin-left");
						dragStartLeft = parseInt(dragStartLeft.substring(0, dragStartLeft.indexOf("px")));
						d3.event.stopPropagation();
						d3.event.preventDefault();
					}
				});
				d3.select("body").on("mouseup", function(){
					if(dragging){
						var diff = d3.event.pageX - dragStart;
						gutter.style("margin-left", (diff + dragStartLeft) + "px");
						var cont = elem.select(".commits-graph-container");
						cont.style("width", (diff + dragStartLeft + 2) + "px" );
						elem.select("div.scroll-container").style("width", diff + dragStartLeft + "px");

						messages.style("padding-left", (diff + dragStartLeft + 10) + "px" );
					}
					dragging = false;
				});
				d3.select("body").on("mousemove", function(){
					if(dragging){
						var diff = d3.event.pageX - dragStart;
						gutter.style("margin-left", (diff + dragStartLeft) + "px");
						d3.event.stopPropagation();

					}
				});
			}
			gutter.style("height", size.height + "px");
			var msgHeader = messages.select("div.msg-header");
			if(msgHeader.empty()){
				msgHeader = messages.append("div")
					.attr("class", "msg-header");
				msgHeader.append("span").attr("class", "branch-btn label aui-lozenge aui-lozenge-subtle")
					.on("click", function(){
						var items = [["Show all", function(){
							options.hiddenBranches = [];
							drawFromRaw();
						}]];
						if(branchVisibilityHandler !== null){
							items.push(["Change...", branchVisibilityHandler]);
						}
						var pos = d3.mouse(messages.node());
						menu.show(items, pos[0], pos[1]);
					});

			}
			var branchLabelText = (data.branches.length + data.hiddenBranches.length) + " branches";
			if(data.hiddenBranches.length > 0) branchLabelText += " (" + data.hiddenBranches.length + " hidden)";
			msgHeader.select("span.branch-btn").text(branchLabelText);

			//labels
			var labelData = messages.selectAll(".commit-msg")
				.data(d3.values(data.commits).filter(function(c){return c.visible;})
				, function (c) {return c.id + "-" + c.orderNr;});
			labelData
				.enter().append("div")
				.attr("class", "commit-msg")
				.attr("id", function (c) { return "msg-" + c.id; })
				.on('click', function (a) {
				  if(d3.event.target.tagName == 'A')return true;
				  // will show menu. Collect items
				  var items = [];
				  if(d3.event.target.tagName == 'SPAN'){
					  // on branch label
					  var clickedBranch = 'refs/heads/' + d3.event.target.innerHTML;
					  items.push(["Hide branch '" + d3.event.target.innerHTML + "'", function(){
						options.hiddenBranches.push(clickedBranch);
						drawFromRaw();
					  }]);
				  }
				  if(displayState.style == "ancestry"){
					  items.push(["Stop highlighting", function(){
						displayState.style = "none";
						displayState.root = null;
						self.updateHighlight();
					  }]);
				  }
				  if(displayState.style !== "ancestry" ||  a.id !== displayState.root){
					  items.push(["Highlight ancestry from here", function(){
						displayState.style = "ancestry";
						displayState.root = a.id;
						self.updateHighlight();
					  }]);
				  }
				  var pos = d3.mouse(messages.node());
				  menu.show(items, pos[0], pos[1]);
				});
			labelData.exit().remove();
			labelData
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
				})
				.transition()
				.attr("style", function (d) {
					var commit = d;
					return "top:" + (y(commit.orderNr) - constants.rowHeight / 2) + "px;";
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
					if(key === "asap"){
							keyInView = key;
							break;
					}
					var elementSelection = d3.select('#msg-' + key);
					if(!elementSelection.empty()) {
						if (isElementInViewport(elementSelection.node())) {
							keyInView = key;
							break;
						}
					}
				}
				if (keyInView) {
					var ourOrderNr = keyInView === "asap" ? 0 : data.commits[keyInView].orderNr;
					for (var key in data.openEnds) {
						var thatOrderNr = key === "asap" ? 0 : data.commits[key].orderNr;
						if (thatOrderNr > ourOrderNr + 200) {
							// to far out, skip
							continue;
						}
						for (var i = 0; i < data.openEnds[key].length; i++) {
							var parentId = data.openEnds[key][i];
							if(downloadedStartPoints.indexOf(parentId) === -1){
								openEndsToBeDownloaded[parentId] = true;
								options.log(LOG.DEBUG, "scheduled: " + parentId);
							}
						}
						delete data.openEnds[key];
					}
					for (var key in openEndsToBeDownloaded) {
						options.log(LOG.DEBUG, "downloading: " + key);
						delete openEndsToBeDownloaded[key];
						openEndsBeingDownloaded[key] = true;
						options.moreDataCallback(key, function (commits, thisKey) {
							delete openEndsBeingDownloaded[thisKey];
							downloadedStartPoints.push(thisKey);
							if (commits) appendData(commits);
							if (Object.keys(openEndsToBeDownloaded).length == 0 && Object.keys(openEndsBeingDownloaded).length == 0) {
								options.log(LOG.DEBUG, "queues empty, ready to draw");
								setTimeout(function () {
									options.log(LOG.DEBUG, "start drawing");
									drawFromRaw();
								}, 50);
							} else {
								options.log(LOG.DEBUG, "waiting, still downloads in progress");
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

		var menu = function(){
			var menu = {};
			var theMenu = null;
			var ensureRef = function(){
				if(theMenu === null || theMenu.empty()){
					theMenu = d3.select(".messages .context-menu");
					theMenu.on("mousemove", function(){
						timeLastSeen = Date.now();
					});
				}
			}
			var timeLastSeen = 0;
			var timer;
			var start = function(){
				timeLastSeen = Date.now();
				timer = setInterval(function(){
					if(timeLastSeen + 10000 < Date.now()){
						menu.hide();
					}
			}, 100);}
			var stop = function(){clearInterval(timer);}

			menu.show = function(items, x, y){
				ensureRef();
				theMenu
					.style("top", y + "px" )
					.style("left", x + "px")
					.style("visibility", "visible");
				theMenu.selectAll("div.item").remove();
				_.each(items, function(item){
					theMenu.append("div")
						.on("click", function(){
							item[1]();
							menu.hide();
						})
						.attr("class", "item")
						.text(item[0]);
				});
				d3.event.stopPropagation();
				d3.select("body").on("click", function(){menu.hide()});
				start();
			}
			menu.hide = function(){
				ensureRef();
				theMenu.style("visibility", "hidden");
				stop();
			}

			return menu;
		}();

		return self;
	})();

	var branchVisibilityHandler = null;
	self.branches = {
		setHidden: function(refs){
			if(!(refs instanceof Array)){
				throw "pass in refs as an array of strings with full ref descriptors of the branches to hide (like 'refs/heads/develop')";
			}
			options.hiddenBranches = refs;
			drawFromRaw();
		},
		setChanged: function(branches){
			// same data as in init structure
			if(updateBranches(branches)){
				drawFromRaw();
				self.drawing.lazyLoad();
			}
		},
		getHidden: function(){
			return options.hiddenBranches;
		},
		getAll: function(){
			return _.map(data.branches.concat(data.hiddenBranches), function(b){
				return {id: b.id, name: b.displayId, 
					lastActivity:b.lastActivity, lastActivityFormatted: moment(b.lastActivity).format("M/D/YY HH:mm:ss"),
					visible: options.hiddenBranches.indexOf(b.id) === -1
				};
			});
		}, 
		registerHandler: function(handler){
			branchVisibilityHandler = handler;
		}
	};

	if (document) {
		//d3.select(document).on("scroll resize", function () {
		d3.select(document)
			.on("scroll", function(){GitFlowVisualize.drawing.lazyLoad();})
			.on("resize", function(){GitFlowVisualize.drawing.lazyLoad();});

		d3.select(document).on("keydown", function () {
			var event = d3.event;
			if (event.ctrlKey && event.shiftKey && event.which == 221) {
				//prompt("Ctrl-C to copy the graph source", GitFlowVisualize.state());
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