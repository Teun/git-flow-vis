
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
/* global _:false , suite:false, test:false, suiteSetup:false, assert:false, GitFlowVisualize:false , Dummy2:false*/

// ------------------------------------------------------------------------------------------ Test Definitions

suite('Library set up', function () {
    test('GitFlowVisualize should be in global scope', function (done) {
        if (GitFlowVisualize) {
            done();
        }
    });

});

suite('Data set 0', function () {
    var data;
    var eventOfCleaned;
    if (/PhantomJS/.test(window.navigator.userAgent)) {
        console.log("PhantomJS environment detected. These tests will not run fast enough because the XHR downloads from PhantomJS are too slow. https://github.com/karma-runner/karma-phantomjs-launcher/issues/30");
        return;
    }

    suiteSetup(function(done) {

        var dataCallback = function(d) { d(Dummy2.Data[0]); };
        var moreCallback = function (sha, d) {
            if (sha === "b71a7a23456f22f7390d547a8a28782530d191367") {
                d({values:[{ "id": "b71a7a23456f22f7390d547a8a28782530d191367", "displayId": "b71a7a2", "author": { "name": "teun", "emailAddress": "teun@funda.nl", "id": 301, "displayName": "Teun Duynstee", "active": true, "slug": "teun"}, "authorTimestamp": 1405529398000, "message": "Yet another commit on release zone branch", "parents": [{ "id": "a71a7a23456f22f7390d547a8a28782530d191367", "displayId": "a71a7a2" }] }]}, sha);
            } else {
                d(null);
            }
        }

        var firstClean = true;
        var dataClean = function(d) {
            data = d;
            if(eventOfCleaned)eventOfCleaned();
            if(firstClean){
                done();
                firstClean = false;
            }
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, moreDataCallback: moreCallback, dataProcessed: dataClean, releaseTagPattern: /refs\/tags\/(r|h)\d$/, showSpinner: function () { } });
    });
    test('Unrecognized branch should be in release zone', function() {
        var commit = data.commits["a71a7a23456f22f7390d547a8a28782530d191367"];
        var column = data.columns[commit.columns[0]];

        assert(column.name[0] === 'r', "unrecognized branch should remain in release zone, because release branch is direct ancestor");

    });
    test('Adding a new head commit should move everything down a line', function(done) {
        var commit = data.commits["a71a7a23456f22f7390d547a8a28782530d191367"];

        assert(commit.orderNr === 0, "latest comit must have orderNr 0");

        var callBackNr = 0;
        eventOfCleaned = function(){
            callBackNr++;
            if(callBackNr === 2){
                // we first change the HEAD pointer. This causes a redraw. Then the async downloading
                // of more commit starts and causes a second event.
                commit = data.commits["a71a7a23456f22f7390d547a8a28782530d191367"];
                assert(commit.orderNr === 1, "latest commit must have orderNr 1");
                done();

            }
        }
        GitFlowVisualize.branches.setChanged({  "values": [{ "id": "refs/heads/any-branch-that-doesnt-match", "displayId": "any-branch-that-doesnt-match", "latestChangeset": "b71a7a23456f22f7390d547a8a28782530d191367", "isDefault": false }]} );
    });


});
suite('Data set 1', function () {
    var data;
    var eventOfCleaned;
    if (/PhantomJS/.test(window.navigator.userAgent)) {
        console.log("PhantomJS environment detected. These tests will not run fast enough because the XHR downloads from PhantomJS are too slow. https://github.com/karma-runner/karma-phantomjs-launcher/issues/30");
        return;
    }

    suiteSetup(function(done) {
        var dataCallback = function(d) { d(Dummy2.Data[1]); };
        var moreCallback = function (sha, d) {
            if (sha === "a71a7a23456f22f7390d547a8a28782530d191367") {
                d({values:[{ "id": "a71a7a23456f22f7390d547a8a28782530d191367", "displayId": "a71a7a2", "author": { "name": "teun", "emailAddress": "teun@funda.nl", "id": 301, "displayName": "Teun Duynstee", "active": true, "slug": "teun", "type": "NORMAL", "link": { "url": "/users/teun", "rel": "self" }, "links": { "self": [{ "href": "https://git.funda.nl/users/teun" }] } }, "authorTimestamp": 1405529398000, "message": "Extra commit on release zone branch", "parents": [{ "id": "771a7a651cf22f7390d547a8a28782530d191367", "displayId": "771a7a6" }] }]}, sha);
            } else {
                d(null);
            }
        }

        var firstClean = true;
        var dataClean = function(d) {
            data = d;
            if(eventOfCleaned)eventOfCleaned();
            if(firstClean){
                done();
                firstClean = false;
            }
        };
        GitFlowVisualize.draw(null, { dataCallback: dataCallback, moreDataCallback: moreCallback, dataProcessed: dataClean, releaseTagPattern: /refs\/tags\/(r|h)\d$/, showSpinner: function () { } });
    });
    test('Adding a head commit that points to an unknown commit must trigger downloading immediately', function(done) {
        var commit = data.commits["a71a7a23456f22f7390d547a8a28782530d191367"];

        assert((!commit), "commit not expected yet");
        eventOfCleaned = function(){
            commit = data.commits["a71a7a23456f22f7390d547a8a28782530d191367"];
            assert(Boolean(commit), "latest commit must have appeared");
            done();

        }
    });


});
