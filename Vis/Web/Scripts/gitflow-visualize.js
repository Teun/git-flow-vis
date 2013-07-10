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
        result.chronoCommits = [];
        for (var id in result.commits) {
            result.chronoCommits.push(id);
            result.chronoCommits.sort(function (a, b) { return result.commits[b].authorTimestamp - result.commits[a].authorTimestamp;})
        }

        return result;
    },
    drawTable: function (data, elem) {
        var table = $('<table/>');
        for (var i = 0 ; i < data.chronoCommits.length; i++) {
            var commit = data.commits[data.chronoCommits[i]];
            var time = new Date(commit.authorTimestamp);
            table.append('<tr><td>' + commit.displayId + '</td><td>' + commit.author.name + '</td><td>' + moment(time).format("M/D/YY HH:mm:ss") + '</td><td>' + commit.message + '</td></tr>');
        }
        $(elem).append(table);
    }
};