# GitFlowVisualize

GitFlowVisualize is a javascript library to visualize git repositories that are using the Git Flow workflow. It uses conventions to know which lineage should be drawn as the master line and which as the develop line. The output is SVG using d3.js. The different types of branches are color coded (master, develop, feature, release, hotfix).

## Installation

### In the browser

You can use GitFlowVisualize directly in your browser by including the `gitflow-visualize.js` file from the `dist/` folder. GitFlowVisualize is registered on the global namespace. Please note that you will also be required to include the following dependencies:

- d3.js (v3)
- Moment
- ThenBy
- Crypto-JS/MD5

If you are not using these dependencies in your own project, it might be easier to include `gitflow-visualize.bundle.js`. This version includes all required dependencies and will allow you to immediately start using GitFlowVisualize in your project.

### In your NodeJS project

Simply install GitFlowVisualize by running 

```
npm install git-flow-vis
```

and include it in your project by adding

```
const GitFlowVisualize = require('git-flow-vis');
```

## Live Examples

You can find two live examples with dummy data in the `examples/` folder. To see them in action, checkout the repository, run `npm install` to install all dependencies and `npm run dist` to compile the project. Afterwards, you can open the `standalone.html` or `multiple_datasets.html` examples in your browser.

## Usage

GitFlowVisualize is available on the global namespace and can be used directly in your project. You can use the following placeholder to kickstart your project.

```
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8">
	<!-- 
		The GitFlowVisualize files are available in the 'dist' folder.
		'gitflow-visualize.bundle.min.js' is a minified version which includes all the dependencies. 
		You can also use 'gitflow-visualize.min.js' if you include all the required dependencies seperately.
	-->
	<script src="gitflow-visualize.bundle.min.js"></script>
	<link rel="stylesheet" type="text/css" href="gitflow-visualize.css">
</head>
<body>
	<div id="drawhere"></div>
	<script type="application/javascript">
		// See the 'options' section of the README for more information on how to confgure GitFlowVisualize
		// The 'dataCallback' and 'moreDataCallback' options are required and are used to retrieve commit data.
		var options = {
			drawElem: document.getElementById('drawhere'),
			dataCallback: function(done) { done({}); },
			moreDataCallback: function(from, done) { done(from, {}); }
		};
		GitFlowVisualize.draw(options);
	</script>
</body>
</html>
```

GitFlowVisualize also has support for AMD and CommonJS dependency resolving. If you wish to include GitFlowVisualise in your NodeJS project you can simply assign it to a variable:

```
const GitFlowVisualize = require('git-flow-vis');
```

## `GitFlowVisualize.draw([elem], opts)`

<dl>
<dt>
elem
</dt>

<dd>
DOM object, placeholder of the Git Flow Chart.
</dd>

<dt>
opts
</dt>

<dd>
Object.
</dd>
</dl>

`elem` is an optional argument, `opts` is required. If `elem` is provided, it must be in the order shown. The `elem` can also be passed using the `opts.drawElem` option. If neither `elem` nor `opts.drawElem` is provided, a `div` placeholder will be appended to the document `body` tag.

### `opts`

`opts.drawElem` is the DOM Element which is used as the placeholder in which the graph is drawn. 

`opts.drawTable` is the DOM Element which is used as the placeholder to hold the commit data table. If not provided, the `opts.drawElem` element is used.

`opts.masterRef` is the git reference to the master branch. Defaults to 'refs/heads/master'.

`opts.developRef` is the git reference to the develop branch. Defaults to 'refs/heads/develop'.

`opts.featurePrefix` is the git reference prefix to all feature branches. Any branch that is prefixed with this value will be considered to be a feature branch. Defaults to 'refs/heads/feature'.

`opts.releasePrefix` is the git reference prefix to all release branches. Any branch that is prefixed with this value will be considered to be a release branch. Defaults to 'refs/heads/release'.

`opts.hotfixPrefix` is the git reference prefix to all hotfix release branches. Any branch that is prefixed with this value will be considered to be a hotfix release branch. Defaults to 'refs/heads/hotfix'.

`opts.releaseZonePattern` is a regular expression (RegExp) that can be used to include other branches in the colored 'Release' zone of the graph. Defaults to '/^refs\/heads\/bugfix/'. 

`opts.releaseTagPattern` is a regular expression (RegExp) that can be used to identify release tags. Defaults to '/refs\/tags\/\d+(\.\d+)+$/'.

`opts.showSpinner()` is a function that is called prior to starting processing of commit data and can be used to show a loading message.

`opts.hideSpinner()` is a function that is called when the commit data has been processed and the graph has been drawn.

`opts.dataCallback(callback(data))` (required) is a function that is called by the graph to retrieve the commit data from the Git repository. It provides a callback function which expects a `data` parameter. The data parameter should use the following JSON schema:

```
{
	branches: { 
		values: [
			{
				"id": STRING - the Git reference to the branch,
				"displayId": STRING - the name of the branch to be displayed in the graph,
				"latestChangeset": STRING - the SHA hash of the latest changeset on the branch
			}
		]
	},
	tags: {
		values: [
			{
				"id": STRING - the Git reference to the tag,
				"displayId": STRING - the name of the tag to be displayed in the graph,
				"latestChangeset": STRING - the SHA hash of the latest changeset on the tag
			}
		]
	},
	commits: [
		{
			values: [
				{
					"id": STRING - the SHA hash of the commit,
					"displayId": STRING - the abbreviated SHA hash of the commit, 
					"author": { 
						"emailAddress": STRING - the email address of the commit author, 
						"displayName": STRING - the name of the author to be displayed in the graph
					}, 
					"authorTimestamp": INTEGER - the timestamp of the commit, 
					"message": STRING - the commit message, 
					"parents": [
						{ 
							"id": STRING - the SHA hash of the commit parent, 
							"displayId": STRING - the abbreviated SHA hash of the commit
						}
					]
				}
			]
		}
	]
}
```

`opts.moreDataCallback(from, callback(data, from))` (required) is a function which is used by the commit graph to lazy load additional commit data on scroll. It passes the SHA hash of the last commit that it retrieved and a callback function which expects a `data` and `from` parameter. The `data` parameter should use the following JSON schema:

```
{
	"size": INTEGER - the number of commits in the values property,
	"values": [
		{
			"id": STRING - the SHA hash of the commit,
			"displayId": STRING - the abbreviated SHA hash of the commit, 
			"author": { 
				"emailAddress": STRING - the email address of the commit author, 
				"displayName": STRING - the name of the author to be displayed in the graph
			}, 
			"authorTimestamp": INTEGER - the timestamp of the commit, 
			"message": STRING - the commit message, 
			"parents": [
				{ 
					"id": STRING - the SHA hash of the commit parent, 
					"displayId": STRING - the abbreviated SHA hash of the commit
				}
			]
		}
	]
}
```

In this case, 'values' is an array of commits with the same JSON schema as the 'commits' property of the `opts.dataCallback()` function. The `from` parameter of the callback should be the same SHA hash that was provided in the `from` parameter of the `opts.moreDataCallback()` function.

`opts.dataProcessed(data)` is a function that is called when the graph has finished processing the commit data. It passes a `data` parameter which includes detailed information of all the commits that have been processed by the graph.

`opts.createCommitUrl(commit)` is a function that is called for each commit which can be used to generate a URL reference to the commit source. The `commit` parameter has the same JSON schema as a commit in the `commits` property of the `opts.dataCallback()` function.

`opts.createAuthorAvatarUrl(author)` is a function that is called for each commit which can be used to generate a URL reference to the author avatar/profile picture. The `author` parameter has the same JSON schema as the `author` object of a commit in the `commits` property of the `opts.dataCallback()` function. If this option is not specified, the default behavior is to use the MD5 hash of the author email address and retrieve the picture from [Gravatar](http://gravatar.com).

## Legal stuff

GitFlowVisualize was created as part of the [Git Flow Chart](https://marketplace.atlassian.com/1212520) add-on for Atlassian Bitbucket. As such, this code has a mixed Commercial and Open Source license. It is released to GitHub to share and to accept contributions. The GitHub Terms of Service apply, so feel free to study the code, make forks and contribute. The project can also be used in Open Source projects that are made public using the GPLv3 license or for personal non-commercial use. Commercial exploitation of the code is explicitely prohibited.

### License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>

Copyright 2014-2017 Teun Duynstee