
suite('Data', function () {
	test('GitFlowVisualize should be in global scope', function (done) {
		if (GitFlowVisualize) {
			done();
		}
	});
	test('Master branch should be isolated', function (done) {
		var dataCallback = function (d) {d(Dummy.Data[2]);}
		var dataClean = function (d) {
			if (d.columns['m'].commits.length == 0) throw "No master branch found";
			var colF1 = d.commits["ea08c2c5f4fa9778baec512b28603ff763ef9022"].columns[0];
			if (d.columns[colF1].name[0] != "f") throw "open feature should be on feature column";
			
			done();
		}

		GitFlowVisualize.draw(null, { dataCallback: dataCallback, dataProcessed: dataClean });
	});

});