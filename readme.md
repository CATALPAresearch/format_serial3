LAD Topics is a *Learning Analytics Dashboard* for Moodle courses. The dashboard presents moodle activities on a timeline and enables the user to define milestones. Each milestone is associated with learning objectes, a deadline, certain course ressources and learning strategies to be applied.

# Features
- visualize moodle activities on the timeline
- enable the user to define milestones by defining a learning objective, necessary ressources, and apropriate learning strategies

# Dependencies
* vue.js, vuex
* d3.js
* crossfilter
* dc.js 

# Installation
1. `git clone`  the repository to /your-moodle/course/format/
2. Open the page https://<moodle>/admin/index.php?cache=1 and follow the install instructions for the plugin.
3. Open a course of you choice and go to the *course settings* (watch out for the littel cog-icon). Set the 'course format' to 'LAD Topics'.

# Roadmap
- CRUD milestones
- show milestones at the ressource pages (e.g. in the forum)
- add additional dashboards

# Getting started
api.php: In this file you'll find the SQL queries. All API get or post requests implement  webservices. The naming conventions are very strict. Take care to to follow the nameing schema for the functions. 

db/services.php: Here your are defining the webservice by referencing the involved files (api.php and its containing classes and functions)

version.php: Every time you are changing the webservice description in service.php you need to increment the version by 1 and update the plugin in moodle (See the *notifications* page in the administration panel)

amd/scr: This is the folder where all custome javascript is located.

lib: This the folder where all third party javascript is stored.

/amd/ladtopics.js: This is the only script that is called by the HTML-DOM of the plugin. By using require.js all other files and dependencies are loaded on demand in this file and passed to the components (like the Timeline or the Assessment) underneath.

amd/src/Assessment.js: This the major file where your assment dashboard has to be written. All necessray dependencies (d3, dc, vue) should be available there. The data from the server should be provided in the function call inside /amd/ladtopics.js, just below the Timeline call.




# Notes
https://docs.moodle.org/dev/Developer_Mode