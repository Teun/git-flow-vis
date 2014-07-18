
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
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean });
    });
    test('Master branch should be isolated', function() {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('Open feature branch should be on f* column', function () {
        var colF1 = data.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"].columns[0];
        assert(data.columns[colF1].name[0] == "f", "open feature is on column " + data.columns[colF1].name);
    });
    test('Needs two release columns and one feature column', function () {
        var releaseColumns = $(Object.keys(data.columns)).filter(function(ix, c) {
            return data.columns[c].name[0] == "r";
        });
        assert(releaseColumns.length == 2, "found " + $.makeArray( releaseColumns.map(function(ix, c) { return data.columns[c].name; })).join() );
        var featureColumns = $(Object.keys(data.columns)).filter(function (ix, c) {
            return data.columns[c].name[0] == "f";
        });
        assert(featureColumns.length == 1, "found " + $.makeArray(featureColumns.map(function (ix, c) { return data.columns[c].name; })).join());
    });

});
suite('Data set 2', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[0]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean });
    });
    test('Master branch should be isolated', function () {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('Last 5 commits were all on develop', function () {
        var latestShas = data.chronoCommits.slice(0, 5);
        var latestCommits = $.map(latestShas, function(sha) {
            return data.commits[sha];
        }).filter(function (c) {
            return c.columns[0] == "d";
        });
        
        assert(latestCommits.length == 5, "The recent commits that wrre done directly on develop should be in the d column. Even though a shorter number of commits leads over the featur branch feature/f4");
    });
    test('Open feature branch should be on f* column', function () {
        var colF1 = data.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"].columns[0];
        assert(data.columns[colF1].name[0] == "f", "open feature is on column " + data.columns[colF1].name);
    });
    test('Needs two release columns and two feature columns', function () {
        var releaseColumns = $(Object.keys(data.columns)).filter(function (ix, c) {
            return data.columns[c].name[0] == "r";
        });
        assert(releaseColumns.length == 2, "found " + $.makeArray(releaseColumns.map(function (ix, c) { return data.columns[c].name; })).join());
        var featureColumns = $(Object.keys(data.columns)).filter(function (ix, c) {
            return data.columns[c].name[0] == "f";
        });
        assert(featureColumns.length == 2, "found " + $.makeArray(featureColumns.map(function (ix, c) { return data.columns[c].name; })).join());
    });
    test('Branches f3 and f1 should not be place on one column', function () {
    	var commitF4 = data.commits["ee268f9d33d940722d974ac1c12cd20cb85bc768"];
    	var commitF1 = data.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"];

    	assert(commitF1.columns[0] != commitF4.columns[0], "Branches are on the same column: " + commitF4.columns[0]);

    	
    });
});