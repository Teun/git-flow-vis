git-flow-vis
============
git-flow-vis is a javascript library to visualize git repositories that are using the Git Flow workflow. It uses conventions to know which lineage should be drawn as the master line and which as the develop line. The output is SVG using d3.js. The different types of branches are color coded (master, develop, feature, release, hotfix).

git-flow-vis is intended to be used in a Stash plugin. It expects data to come in the format the Stash's REST apis return. The library can however be used in other environments.
