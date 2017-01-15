
// ------------------------------------------------------------------------------------------ Test Definitions

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
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean, releaseTagPattern: /refs\/tags\/(r|h)\d$/, showSpinner: function () { } });
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
    test('Bugfix branch in same column as release', function() {
        var commitBugfix = data.commits["771a7a651cf22f7390d547a8a28782530d191367"];
        var commitR2 = data.commits["0aabee3cc5a668e1dffd3c464b18890caf98e6e9"];

        assert(commitBugfix.columns[0] === commitR2.columns[0], "Bugfix commit and release tip should be on the same column");


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
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean, releaseTagPattern: /refs\/tags\/(r|h)\d$/, showSpinner: function () { } });
    });
    test('Master branch should be isolated', function() {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('Last 5 commits were all on develop', function() {
        var latestShas = data.chronoCommits.slice(0, 5);
        var latestCommits = $.map(latestShas, function(sha) {
            return data.commits[sha];
        }).filter(function(c) {
            return c.columns[0][0] == "d";
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
suite('Realistic data set (3)', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[1]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean, showSpinner: function () { } });
    });
    test('Master branch should be isolated', function () {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
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
            assert(commit.columns[0][0] == 'd', "Commit " + commit.id + " (" + commit.message + ") should be on develop column. Now on " + commit.columns[0]);
        }
    });
    test('Related branches should be in the same group', function () {
    	var shas = ["9f21aa01d191e9342c71df16c87d5d9fe78a0a8c", "97ced13be8581ec0fd8b9394a40e6cec868317e4"];
    	assert(data.columns[data.commits[shas[0]].columns[0]].group == data.columns[data.commits[shas[1]].columns[0]].group,
				"These two commits should be in the same group: " + shas.join(','));
    });
    test('Some commits should be on develop, although not in primary line', function() {
        var shas = [
            "88c1a2b70a36eae0ac1e14791467f428293001a9",
            "b922548bfc7dafb8fe6ad5e8042adacc3817fe1a"
        ];
        for (var i = 0; i < shas.length; i++) {
            var commit = data.commits[shas[i]];
            assert(commit.columns[0][0] == 'd', "Commit " + commit.id + " (" + commit.message + ") should be on develop column. Now on " + commit.columns[0]);
        }

    });
    
});

suite('Realistic dataset (4)', function() {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[4]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, {
            dataCallback: dataCallback, dataProcessed: dataClean, showSpinner: function() {}
        });
    });
    test('Master branch should be isolated', function() {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('OBJ-847 commits should not be on develop', function () {
    	var commit = data.commits['c8d172c52045ca6bd8da96b50492c97fc2c0d492'];
    	assert(commit.columns[0][0] != 'd', "Commit " + commit.id + " (" + commit.message + ") should not be on develop column. Now it is.");
    });
});


suite('Realistic dataset (5)', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[5]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, {
            dataCallback: dataCallback, dataProcessed: dataClean, showSpinner: function () { }
        });
    });
    test('Master branch should be isolated', function () {
        assert(data.columns['m'].commits.length > 0, "No master branch found");
    });
    test('Commit 8a1355 should be on first develop column', function () {
        var commit = data.commits['8a1355bed1bb8be4dcffa179b3f5c2f61e70f325'];
        var column = data.columns[commit.columns[0]];
        assert(column.name === 'd0', "Commit " + commit.id + " (" + commit.message + ") should be on first develop column. Now on " + column.name);
    });
    test('Commit 40ebb6 should be on a release column', function () {
        var commit = data.commits['40ebb6d70110a304f0e7fa72854e35a9577bc4f4'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'r', "Commit " + commit.id + " (" + commit.message + ") should be on a release column. Now on " + column.name);
    });
    
    
});
suite('Situation with feature branch as release branch', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[6]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, {
            dataCallback: dataCallback, dataProcessed: dataClean, showSpinner: function () { }
        });
    });
    test('Commit 367bee should be on a feature column', function () {
        var commit = data.commits['367bee2cb6a85217cb23d405cd9ac68a6039d096'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'f', "Commit " + commit.id + " (" + commit.message + ") should be on a feature column. Now on " + column.name);
    });
    test('Commit d125ab should be on the develop column', function () {
        var commit = data.commits['d125ab84c422febd4dabca6012409848ca4a09bb'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'd', "Commit " + commit.id + " (" + commit.message + ") should be on the develop branch. Now on " + column.name);
    });

    
});
suite('Situation non-standard branch names', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[7]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, {
            dataCallback: dataCallback, dataProcessed: dataClean, showSpinner: function () { }
        });
    });
    test('Commit bac09e5 should be on a feature column', function () {
        var commit = data.commits['bac09e5378cae08a4c52107ba58c0318577cf557'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'f', "Commit " + commit.id + " (" + commit.message + ") should be on a feature column. Now on " + column.name);
    });
    test('Commit aac09e5 should be on a release column', function () {
        var commit = data.commits['aac09e5378cae08a4c52107ba58c0318577cf557'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'r', "Commit " + commit.id + " (" + commit.message + ") should be on the release column. Now on " + column.name);
    });
});
suite('Situation non-standard branch names with different config', function () {
    var data;
    suiteSetup(function (done) {
        var dataCallback = function (d) { d(Dummy.Data[7]); };
        var dataClean = function (d) {
            data = d;
            done();
        };
        GitFlowVisualize.draw(null, {
            dataCallback: dataCallback, dataProcessed: dataClean, showSpinner: function () { },
            releaseZonePattern: /^(?!.*bugfix)/  /* switch the meaning using a negative lookahaed expression*/
        });
    });
    test('Commit bac09e5 should be on a release column', function () {
        var commit = data.commits['bac09e5378cae08a4c52107ba58c0318577cf557'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'r', "Commit " + commit.id + " (" + commit.message + ") should be on a release column. Now on " + column.name);
    });
    test('Commit aac09e5 should be on a feature column', function () {
        var commit = data.commits['aac09e5378cae08a4c52107ba58c0318577cf557'];
        var column = data.columns[commit.columns[0]];
        assert(column.name[0] === 'f', "Commit " + commit.id + " (" + commit.message + ") should be on the feature column. Now on " + column.name);
    });
});
