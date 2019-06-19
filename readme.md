LAD Topics is a *Learning Analytics Dashboard* for Moodle courses. The dashboard presents moodle activities on a timeline and enables the user to define milestones. Each milestone is associated with learning objectes, a deadline, certain course ressources and learning strategies to be applied.


# Dependencies
* d3.js
* crossfilter
* dc.js 
* vue.js, vuex

# Installation
1. `git clone`  the repository to /your-moodle/course/format/
2. Open the page <moodle>/admin/index.php?cache=1 and follow the install instructions for the plugin.
3. Open a course of you choice and go to the course settings. Set the 'course format' to 'LAD Topics'.

# Roadmap
- include moodle activities on the timeline
- CRUD milestones using Vue.js
- show milestones at the ressource pages (e.g. in the forum)
- add additional dashboards

# Notes
https://docs.moodle.org/dev/Developer_Mode