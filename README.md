git-flow-vis
============
git-flow-vis is a javascript library to visualize git repositories that are using the Git Flow workflow. It uses conventions to know which lineage should be drawn as the master line and which as the develop line. The output is SVG using d3.js. The different types of branches are color coded (master, develop, feature, release, hotfix).

git-flow-vis is intended to be used in a Stash plugin. It expects data to come in the format the Stash's REST apis return. The library can however be used in other environments.

Note that this code is not Open Source licensed. I would like to share and will accept contributions. However, I'd also like to make some money off my work and plan to do so through Atlassians Marketplace. I cannot think of a way to prevent a free rider from repackaging my work and sell it for a dollar less. I will keep use of the plug-in free for non-commercial and personal use. 

Copyright 2014 Teun Duynstee