var GitFlowVisualize = {
    draw: function (data, elem) {
        var cleanDataset = this.cleanup(data);
        this.drawTable(cleanDataset, elem);
    },
    cleanup:function(data){
        var result = {};
        result.commits = {};
        for (var i = 0; i < data.commits.length; i++) {
            for (var j = 0; j < data.commits[i].values.length; j++) {
                var commit = data.commits[i].values[j];
                result.commits[commit.id] = commit;
            }
        }
        for (var id in result.commits) {
            var commit = result.commits[id];
            for (var i = 0; i < commit.parents.length; i++) {
                var parent = result.commits[commit.parents[i].id];
                this.setChildToParent(parent, commit.id);
            }
        }
        result.branches = data.branches.values;
        for (var i = 0; i < result.branches.length; i++) {
            var branch = result.branches[i];
            var commit = result.commits[branch.latestChangeset];
            if (commit) {
                commit.labels = (commit.labels || []);
                commit.labels.push(branch.id);
            }
        }
        result.tags = data.tags.values;
        for (var i = 0; i < result.tags.length; i++) {
            var tag = result.tags[i];
            var commit = result.commits[tag.latestChangeset];
            if (commit) {
                commit.labels = (commit.labels || []);
                commit.labels.push(tag.id);
            }
        }
        result.chronoCommits = [];
        for (var id in result.commits) {
            result.chronoCommits.push(id);
            result.chronoCommits.sort(function (a, b) { return result.commits[b].authorTimestamp - result.commits[a].authorTimestamp;})
        }


        this.setColumns(result);

        return result;
    },
    setChildToParent: function (parent, childId) {
        parent.children = parent.children || [];
        parent.children.push(childId);
    },

    setColumns: function (data) {
        this.isolateMaster(data);
        this.isolateDevelop(data);
        this.isolateRest(data);
        this.separateReleaseFeatureBranches(data);
    },
    isolateMaster: function (data) {
        var versionCommitPath = this.findShortestPathAlong(
            /*from*/  $.grep(data.branches, function (item) { return (item.id == "refs/heads/master"); })[0].latestChangeset,
            /*along*/ $.map($.grep(data.tags, function (tag) { return tag.id.match(/refs\/tags\/\d+(\.]d+)*/) }), function(i){return i.latestChangeset;}),
            data
            );
        for (var i = 0; i < versionCommitPath.length; i++) {
            this.putCommitInColumn(versionCommitPath[i], 'm', data);
        }
    },
    isolateDevelop: function (data) {
        var versionCommitPath = this.findShortestPathAlong(
            /*from*/  $.grep(data.branches, function (item) { return (item.id == "refs/heads/integration"); })[0].latestChangeset,
            /*along*/ $.grep(data.chronoCommits, function (key) {
                var m =data.commits[key].message.match(/^Merge pull request.* to integration/);
                return m != null;
            }),
            data
            );
        for (var i = 0; i < versionCommitPath.length; i++) {
            this.putCommitInColumn(versionCommitPath[i], 'd', data);
        }
    },
    isolateRest: function (data) {
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
                    this.putCommitInColumn(commit.id, "c" + current, data);
                    current++;
                } else {
                    var firstChild = data.commits[nonMasterDevelopChildren[0]]
                    this.putCommitInColumn(commit.id, firstChild.columns[0], data);
                }
            }
        }
    },
    separateReleaseFeatureBranches: function (data) {
        data.columns["c2"].name = "r2";
        data.columns["c0"].name = "f0";
        data.columns["c1"].name = "f1";
        data.columns["c3"].name = "f3";
    },
    putCommitInColumn: function (commitId, columnName, data) {
        if(!data.columns)data.columns = {};
        if(!(columnName in data.columns)){
            data.columns[columnName] = { commits: [], name:columnName };
        }
        var commit = data.commits[commitId];
        if (commit) {
            commit.columns = commit.columns || [];
            commit.columns.push(columnName);
            data.columns[columnName].commits.push(commitId);
        }
    },
    findShortestPathAlong: function (from, along, data) {
        var setOfPaths = [];
        setOfPaths.push([from]);
        while (true) {
            var prefix = setOfPaths.shift();
            var nextToFind = data.commits[along[0]];
            var tail = data.commits[prefix[prefix.length - 1]];
            if (tail.id == nextToFind.id) {
                //skip this id
                along.shift();
                nextToFind = data.commits[along[0]];
            }
            for (var i = 0; i < tail.parents.length; i++) {
                var parent = data.commits[tail.parents[i].id];
                var newPath = prefix.slice(0);
                newPath.push(parent.id);
                if (parent.id == nextToFind.id) {
                    setOfPaths = [newPath];
                    var found = along.shift();
                    break;
                } else if (parent.authorTimestamp > nextToFind.authorTimestamp) {
                    // followup
                    setOfPaths.push(newPath);
                }
            }

            if (along.length == 0) {
                return setOfPaths[0];
            }
            if (setOfPaths.length == 0) return [];
        }

    },
    drawTable: function (data, elem) {
        var table = $('<table/>');
        table.append('<tr>' + this.drawColumnsAsHeaders(data) + '<td>sha</td><td>parent</td><td>author</td><td>at</td><td>msg</td></tr>');
        for (var i = 0 ; i < data.chronoCommits.length; i++) {
            var commit = data.commits[data.chronoCommits[i]];
            var time = new Date(commit.authorTimestamp);
            table.append('<tr>' + this.drawColumnsAsCells(data, commit) + '<td>' + commit.displayId + '</td><td>' + this.showCommaSeparated(commit.parents) + '</td><td>' + commit.author.name + '</td><td>' + moment(time).format("M/D/YY HH:mm:ss") + '</td><td>' + commit.message + '</td></tr>');
        }
        $(elem).append(table);
    },
    showCommaSeparated: function (arr) {
        return $.map(arr, function (i) { return i.displayId;}).join(", ");
    },
    keysInOrder: function(obj){
        var keysInOrder = $.map(obj, function (v, k) { return k });
        keysInOrder.sort(function (k1, k2) {
            var groupVal = function (k) { return { 'm': 1, 'd': 3, 'f': 4, 'r': 2 }[obj[k].name[0]] || 5 };
            return groupVal(k1) - groupVal(k2);
        });
        return keysInOrder
    },
    drawColumnsAsCells: function (data, commit) {
        var result = "";
        var keys = this.keysInOrder(data.columns);
        for (var i = 0; i < keys.length; i++) {
            var col = keys[i];
            result += "<td>";
            if ($.inArray(col, commit.columns) > -1) {
                result += "o";
            }
            result += "</td>";
        }
        return result;
    },
    drawColumnsAsHeaders: function (data) {
        var result = "";
        var keys = this.keysInOrder(data.columns);
        for (var i = 0; i < keys.length; i++) {
            var col = keys[i];
            result += "<td>" + data.columns[col].name + "</td>";
        }
        return result;
    }
};