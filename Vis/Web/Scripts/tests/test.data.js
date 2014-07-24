
suite('Library set up', function () {
    test('GitFlowVisualize should be in global scope', function (done) {
        if (GitFlowVisualize) {
            done();
        }
    });

});

suite('Data set 1', function () {
    var data;
    suiteSetup(function(done) {
        var dataCallback = function(d) { d(Dummy.Data[2]); };
        var dataClean = function(d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean, releaseTagPattern: /refs\/tags\/(r|h)\d$/ });
    });
    test('Master branch should be isolated', function() {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('Open feature branch should be on f* column', function () {
        var colF1 = data.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"].columns[0];
        assert(data.columns[colF1].name[0] == "f", "open feature is on column " + data.columns[colF1].name);
    });
    test('Needs two release columns and two feature columns', function () {
        var releaseColumns = $(Object.keys(data.columns)).filter(function(ix, c) {
            return data.columns[c].name[0] == "r";
        });
        assert(releaseColumns.length == 2, "found " + $.makeArray( releaseColumns.map(function(ix, c) { return data.columns[c].name; })).join() );
        var featureColumns = $(Object.keys(data.columns)).filter(function (ix, c) {
            return data.columns[c].name[0] == "f";
        });
        assert(featureColumns.length == 2, "found " + $.makeArray(featureColumns.map(function (ix, c) { return data.columns[c].name; })).join());
    });

});
suite('Data set 2', function() {
    var data;
    suiteSetup(function(done) {
        var dataCallback = function(d) { d(Dummy.Data[0]); };
        var dataClean = function(d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean, releaseTagPattern: /refs\/tags\/(r|h)\d$/ });
    });
    test('Master branch should be isolated', function() {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('Last 5 commits were all on develop', function() {
        var latestShas = data.chronoCommits.slice(0, 5);
        var latestCommits = $.map(latestShas, function(sha) {
            return data.commits[sha];
        }).filter(function(c) {
            return c.columns[0] == "d";
        });

        assert(latestCommits.length == 5, "The recent commits that were done directly on develop should be in the d column. Even though a shorter number of commits leads over the featur branch feature/f4");
    });
    test("Cherry picked commits should appear in parentage-order, not in authorTimestamp order", function() {
        var cherrypicked = data.commits["19f5bebe9d537f56385f2e7a18f41358dba35013"];
        assert(cherrypicked.orderNr == 2, "Cherrypicked commit appears at " + cherrypicked.orderNr);
    });
    test('Open feature branch should be on f* column', function() {
        var colF1 = data.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"].columns[0];
        assert(data.columns[colF1].name[0] == "f", "open feature is on column " + data.columns[colF1].name);
    });
    test('Needs two release columns and three feature columns', function() {
        var releaseColumns = $(Object.keys(data.columns)).filter(function(ix, c) {
            return data.columns[c].name[0] == "r";
        });
        assert(releaseColumns.length == 2, "found " + $.makeArray(releaseColumns.map(function(ix, c) { return data.columns[c].name; })).join());
        var featureColumns = $(Object.keys(data.columns)).filter(function(ix, c) {
            return data.columns[c].name[0] == "f";
        });
        assert(featureColumns.length == 3, "found " + $.makeArray(featureColumns.map(function(ix, c) { return data.columns[c].name; })).join());
    });
    test('Branches f3 and f1 should not be place on one column', function() {
        var commitF4 = data.commits["ee268f9d33d940722d974ac1c12cd20cb85bc768"];
        var commitF1 = data.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"];

        assert(commitF1.columns[0] != commitF4.columns[0], "Branches are on the same column: " + commitF4.columns[0]);


    });
});
suite('Realistic data set', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[1]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean });
    });
    test('Certain known commits should be on develop', function () {
        var shas = [
            "c0a3b213f475f6b6fa367a18620ce6e15cc6ca63",
            "780166cccae94196cccfcc25ab3377ffebdc9c77",
            "d91595f546a0076b4da305dbc562d330de69c225",
            "95cc45b24338a7489dd7468aeefd284821f84532",
            "aef22550ae3d7112be370cb7c55bd3b7a0d51e86",
            "419ee2a7bfe63fa0e74a3f7b2206e593272951f4",
        ];
        for (var i = 0; i < shas.length; i++) {
            var commit = data.commits[shas[i]];
            assert(commit.columns[0] == 'd', "Commit " + commit.id + " (" + commit.message + ") should be on develop column. Now on " + commit.columns[0]);
        }
    });
    test('Related branches should be in the same group', function () {
    	var shas = ["9f21aa01d191e9342c71df16c87d5d9fe78a0a8c", "97ced13be8581ec0fd8b9394a40e6cec868317e4"];
    	assert(data.columns[data.commits[shas[0]].columns[0]].group == data.columns[data.commits[shas[1]].columns[0]].group,
				"These two commits should be in the same group: " + shas.join(','));
    });
});
