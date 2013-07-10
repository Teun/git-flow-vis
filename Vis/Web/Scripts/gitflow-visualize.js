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
        return result;
    },
    drawTable: function (data, elem) {
        var table = $('<table/>');
        for (var id in data.commits) {
            var commit = data.commits[id];
            table.append('<tr><td>' + commit.displayId + '</td><td>' + commit.author.name + '</td><td>' + commit.authorTimestamp + '</td><td>' + commit.message + '</td></tr>');
        }
        $(elem).append(table);
    }
};