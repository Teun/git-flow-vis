var GitFlowVisualize =
    
    (function()
    {
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
            releasePrefix: "refs/heads/r/",
            hotfixPrefix: "refs/heads/h/",

            // any tag starting with this prefix will enhance the chance of the commit being on the develop branch
            developBrancheHintPrefix: "devhint/",
            // this pattern should match the tags that are given to release commits on master (not to hotfix releases that are not on master)
            releaseTagPattern: /refs\/tags\/\d+(\.\d+)*\.0$/,
        };

        var cleanup = function(_data){
            var result = {};
            data = result;
            result.commits = {};
            for (var i = 0; i < _data.commits.length; i++) {
                for (var j = 0; j < _data.commits[i].values.length; j++) {
                    var commit = _data.commits[i].values[j];
                    result.commits[commit.id] = commit;
                }
            }
            for (var id in result.commits) {
                var commit = result.commits[id];
				if(!commit.children)commit.children = [];
                for (var i = 0; i < commit.parents.length; i++) {
                    var parent = result.commits[commit.parents[i].id];
                    setChildToParent(parent, commit.id);
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
			for (var i = 0; i < result.chronoCommits.length; i++) {result.commits[result.chronoCommits[i]].orderNr = i;}


            setColumns(result);
        };
        var setChildToParent = function (parent, childId) {
            parent.children = parent.children || [];
            parent.children.push(childId);
        };
        var setColumns = function() {
            isolateMaster();
            isolateDevelop();
            isolateRest();
            separateReleaseFeatureBranches();
            combineColumnsOfType('f');
            combineColumnsOfType('r');
        };
        var isolateMaster = function () {
			var head = $.grep(data.branches, function (item) { return (item.id == options.masterRef); });
			if(head.length == 0) return;
            var versionCommitPath = findShortestPathAlong(
                /*from*/  head[0].latestChangeset,
                /*along*/ $.map($.grep(data.tags, function (tag) { return tag.id.match(options.releaseTagPattern) }), function(i){return i.latestChangeset;}),
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
			if(head.length == 0) return;
			
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
                    var nonMasterDevelopChildren = $.grep(commit.children, function(childId){
                        var child = data.commits[childId];
                        if(!child.columns)return true;
                        return !(child.columns[0] == "m" || child.columns[0] == "d");
                    });
                    if(nonMasterDevelopChildren.length == 0)
                    {
                        putCommitInColumn(commit.id, "c" + current, data);
                        current++;
                    } else {
                        var firstChild = data.commits[nonMasterDevelopChildren[0]]
                        putCommitInColumn(commit.id, firstChild.columns[0], data);
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
                    var lastCommitOfFirst = data.commits[earlierColumn.commits[earlierColumn.commits.length - 1]];
                    var firstCommitOfSecond = data.commits[column.commits[0]];
                    if (firstCommitOfSecond.orderNr > lastCommitOfFirst.orderNr) {
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
            if(!data.columns)data.columns = {};
            if(!(columnName in data.columns)){
                data.columns[columnName] = { commits: [], name:columnName, id:columnName };
            }
            var commit = data.commits[commitId];
            if (commit) {
                commit.columns = commit.columns || [];
                commit.columns.push(columnName);
                data.columns[columnName].commits.push(commitId);
            }
        };
        var findAllPathsFrom = function (from, blockedNode) {
            var closedPaths = [];
            var setOfPaths = [];
            setOfPaths.push([from]);
            while (true) {
                var prefix = setOfPaths.shift();
                var tail = data.commits[prefix[prefix.length - 1]];
                var accessibleParents = tail.parents.filter(function (p) { return !blockedNode(data.commits[p.id], prefix); });
                if (accessibleParents.length == 0) {
                    closedPaths.push(prefix);
                }
                for (var i = 0; i < accessibleParents.length; i++) {
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
            var blockedBecauseOfAlong = function (commit, prefix) {
                var waitingForIndex = 0;
                for (var i = 0; i < prefix.length; i++) {
                    if (along.length <= waitingForIndex) return false; // always OK if we're not waiting for anything anymore
                    if (along[waitingForIndex] == prefix[i]) {
                        waitingForIndex++;
                    }
                }
                return commit.authorTimestamp < data.commits[waitingForIndex]; // no nodes that are older than the one we're waiting for please
            }
            var allAlong = findAllPathsFrom(from, blockedBecauseOfAlong);
            if (allAlong.length == 0) return [];
            return allAlong.sort(function (v1, v2) { return v1.length - v2.length; })[0];

        }
        var findDevelopPathFrom = function (from) {
            var blockedNode = function (c, path) {
                // no part of m can be d
                if (c.columns && c.columns[0] == 'm') return true;
                // in a line, you cannot have more than one child within the lineage
                var childrenInPath = path.map(function (d) { return data.commits[d];}).filter(function (d) {

                    return d.parents.filter(function (p) {
                        return p.id === c.id;
                    }).length > 0;
                });
                if (childrenInPath.length != 1) return true;
                return false;
            }
            var closedPaths = findAllPathsFrom(from, blockedNode);
            function firstBy(e) { var t = function (t, r) { return e(t, r) || n(t, r) }; t.thenBy = function (e) { if (n.thenBy) { n.thenBy(e) } else { n = firstBy(e) } return t }; var n = function () { return 0 }; return t }
            var oldestTail = function (nr1, nr2) {
                // needs old ancestor
                var tail1 = data.commits[nr1[nr1.length - 1]];
                var tail2 = data.commits[nr2[nr2.length - 1]];
                return tail1.authorTimestamp - tail2.authorTimestamp;
            }
            var leastNonMergeCommits = function (nr1, nr2) {
                function countNonMergeCommits(list) {
                    var res = list.filter(function (id) { return data.commits[id].parents.length <= 1; }).length
                    return res;
                }
                return countNonMergeCommits(nr1) - countNonMergeCommits(nr2);
            }
            return closedPaths.sort(
                firstBy(oldestTail)
                .thenBy(leastNonMergeCommits)
                )[0];
        }
        self.draw = function (data, elem, opt) {
			options = $.extend(options, opt);
            data = cleanup(data);
            self.drawing.drawTable(elem);
            self.drawing.drawGraph(elem);
        };
        self.drawing = (function(){
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
                return $.map(arr, function (i) { return i.displayId;}).join(", ");
            }
            var keysInOrder = function(obj){
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
                var size = { width: 500, height: 800 };
                var margin = 10;

                var svg = d3.select(elem).append("svg")
                    .attr("width", size.width + 2*margin)
                    .attr("height", size.height + 2 * margin)
                  .append("g")
                    .attr("transform", "translate(" + margin + "," + margin + ")");

                var columnsInOrder = keysInOrder(data.columns);
                var x = d3.scale.ordinal()
                    .domain(columnsInOrder)
                    .rangePoints([0, Math.min(size.width, 30 * columnsInOrder.length)]);
                var y = d3.scale.linear()
                    .domain([0, 20])
                    .range([0, size.height]);

                var line = d3.svg.line()
                    //.interpolate("basis")
                    .x(function (d) { return x(d.x); })
                    .y(function (d) { return y(d.y); });
                var connector = function(d) {
                    var childCommit = data.commits[d.c];
                    var parentCommit = data.commits[d.p];
                    var leftToRight = (x(childCommit.columns[0]) > x(parentCommit.columns[0]));
                    //var intermediateColumn = leftToRight ? parentCommit.columns[0] : childCommit.columns[0];
                    var intermediateColumn = parentCommit.columns[0];
                    var intermediateRow = parentCommit.orderNr - 1;
                    if (intermediateRow <= childCommit.orderNr) intermediateRow = childCommit.orderNr + 0.5;
                    var points = [
                        { x: childCommit.columns[0], y: childCommit.orderNr },
                        { x: intermediateColumn, y: intermediateRow},
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

        
                //labels
                var label = svg.selectAll(".tag")
                    .data(d3.values(data.labels))
                    .enter().append("g")
                    .attr("class", "tag")
                    .attr("transform", function (d) {
                        var commit = data.commits[d.latestChangeset];
						if(!commit)return "(-100, -100)";
                        var indexInCommit = $.inArray(d.id, commit.labels);
                        return "translate(" + (x(commit.columns[0]) + 10) + "," + (y(commit.orderNr)+4 + indexInCommit*14) + ")"
                    })
                    .attr("x", 10)
                    .attr("y", 5);
                label.append("text")
                    .attr("transform", "rotate(-10) ")
                    .text(function (d) { return d.displayId; })
                
                if ($('#commit-panel').length == 0) {
                    panel = svg.append("g").attr("id", "commit-panel").attr("x", 0).attr("y", 0);
                    panel.append("rect")
                        .attr("class", "commit-panel")
                        .attr("x", 0).attr("y", 0).attr("width", 200).attr("height", 150).attr("rx", 5).attr("ry", 5);
                    panel.append("text").attr("id", "author-name").attr("x", 5).attr("y", 15);
                    panel.append("text").attr("id", "commit-message").attr("x", 5).attr("y", 30).attr("width", 180).attr("height", "auto");
                }

                $('.commit').hover(
                    function (evt) {
                        var c = $(evt.target);
                        var commit = data.commits[c.attr("sha")];
                        var p = $(panel[0]);
                        p.attr("transform", "translate("+ (Number(c.attr("cx")) + 10) + "," + c.attr("cy") + ")");
                        $('#author-name').text(commit.displayId + " : " + commit.author.name);
                        $('#commit-message').text(commit.message);
                        p.show(200);
                    },
                    function () { $(panel[0]).fadeOut(200);  }
                    );
            };
            var branchType = function (childId, parentId) {
                var ct = function (id) {
                    var commit = data.commits[id];
                    var columns = commit.columns.map(function (d) { return data.columns[d]; });
					if(!columns[0])return '?';
                    return columns[0].name[0];
                }
                var prioHash = { 'm': 1, 'd': 0, 'r': 2, 'f': 3 };
                var cols = [ct(childId), ct(parentId)];
                cols.sort(function (v1, v2) { return prioHash[v2] - prioHash[v1]; });
                return cols[0] || "default";
            };
            return self;

        
        })();

        return self;
    })();

