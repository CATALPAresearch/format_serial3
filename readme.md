Note: *yFbv6wMRnUwgFYC

LAD Topics is a *Learning Analytics Dashboard* for Moodle courses. The dashboard consists of several widgets
that can be selected and arranged to the users liking.

**Implemented Widgets**

- Progress Chart
- Learner goals and Indicators
- Recommendations
- Task List
- Deadlines
- Quiz Statistics

**Roadmap**

- Add the resource list
- Add a time tracking tool and display
- Add all menu bar functionality


# Installation

1. `git clone`  the repository to /your-moodle/course/format/
2. Open the page https://<moodle>/admin/index.php?cache=1 and follow the install instructions for the plugin.
3. Open a course of you choice and go to the *course settings* (watch out for the little cog-icon). Set the 'course
   format' to 'LAD Topics'.


# Development

* run `npm run install` to install all dependencies

**Using nodemon**
* run `nodemon` in the vue folder

**Using grunt**

* `grunt plugin-build` transpiles all js code
* `grunt plugin-check` run js linter
* `grunt plugin-css` bundles and minifies css files
* `grunt plugin-all` handles both tasks mentioned above

**Notes**

https://docs.moodle.org/dev/Developer_Mode

**Dependencies**

* vue.js, vuex
* d3.js
* vue-grid-layout library (https://jbaysolutions.github.io/vue-grid-layout/)

**Getting started**

api.php: In this file you'll find the SQL queries. All API get or post requests implement webservices. The naming
conventions are very strict. Take care to to follow the nameing schema for the functions.

db/services.php: Here your are defining the webservice by referencing the involved files (api.php and its containing
classes and functions)

version.php: Every time you are changing the webservice description in service.php you need to increment the version by
1 and update the plugin in moodle (See the *notifications* page in the administration panel)

amd/scr: This is the folder where all custome javascript is located.

/amd/app-lazy.min.js: This is the only script that is called by the HTML-DOM of the plugin. By using require.js all other
files and dependencies are loaded on demand in this file and passed to the components underneath.

/vue: This is the folder where all code for the Vue application is stored.

/vue/js: This the folder where all third party javascript is stored.

/vue/store: This folder contains all files related to the vuex store.

/vue/components: This folder contains all components for the dashboard. In the 'widgets' folder all widgets-components
are stored that are being called by 'App.vue'.

/vue/scripts: This folder contains utility functions.

/vue/data: This data contains data used in the dashboard stored as json. This data includes the adaptation-rules and 
thresholds.

A good sheet sheet: http://tech.solin.eu/doku.php?id=moodle:course_construction



## Contributors
* Niels Seidel
* Marc Burchart
* Heike Karolyi
* Valerie Meyer