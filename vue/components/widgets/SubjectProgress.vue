<template>
    <div class="py-3">
        <widget-heading title="Progress" icon="fa-hourglass-o" :info-content="info"></widget-heading>
        <div id="dashboard-completion">
            <div class="section-selection mr-2" :class="currentSection === 0 ? 'section-selection--current' : ''" @click="setSection(0)">
                <p class="my-1">All</p>
                <div class="progress mb-2">
    <!--                    bootstrap allows for mulitple colors in progress bar -> e.g. green for strong topics, red for weak -->
                    <div class="progress-bar" role="progressbar" :style="{'width': calculateProgress + '%'}" :aria-valuenow="calculateProgress" aria-valuemin="0" aria-valuemax="100">{{ calculateProgress }}%</div>
                </div>
            </div>

            <div class="w-100 mb-4">
                <div v-for="(section, index) in sections.slice(1, sections.length)" :key="index" :style="{'width': calculateWidth(sections.length) + '%'}" class="d-inline-block" @click="setSection(index + 1)">
                    <div class="section-selection mr-2" :class="currentSection === index + 1 ? 'section-selection--current' : ''">
                        <p class="section-names mb-1 small" :title="section[0].sectionname">{{ section[0].sectionname }}</p>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" :style="{'width': calculateSectionProgress(section) + '%'}" :aria-valuenow="calculateSectionProgress(section)" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-for="(type, aIndex) in activityNames" :key="aIndex" class="row">
                <span class="col-3">{{ activities[type][0].modulename }}</span>
                <div class="col-9">
                    <span v-for="(activity, aCount) in currentActivities[type]" :key="aCount">
                        <button type="button" data-container="body" data-toggle="popover" data-trigger="click" data-html="true" data-placement="top" :data-content="getPopoverContent(type, activity)" class="subject-progress__popover" :title="getPopoverContent(type, activity)" @click="onClick(type, activity)">
                            <div :class="activity.completion === 1 ? 'rect-green completion-rect' : 'rect-blue completion-rect'"></div>
                        </button>
                    </span>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import Communication from '../../scripts/communication';
import WidgetHeading from "../WidgetHeading.vue";



export default {
    name: "SubjectProgress",

    components: {WidgetHeading},

    data: function () {
        return {
            total: 0,
            currentSection: 0,
            activities: null,
            currentActivities: null,
            sections: [],
            info: 'Informationen über das Widget',
            // current: { id: 0, section: 0 },
            sectionnames: [],
            activityNames: [],
            stats: [],
            sumScores: {
                longpage: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                quiz: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                assign: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                hypervideo: { count: 0, complete: 0, achieved_score: 0, max_score: 0 }
            },
        };
    },

    mounted: function () {
        this.loadCourseData();
    },

    computed: {
        calculateProgress() {
            const x = this.sections.map(a => a.filter(({ completion }) => completion === 1 ).length)
            const sum = x.reduce((total, current) => {
                return total + current;
            }, 0)

            return Math.floor(sum/this.total*100)
        },

        getCurrentActivities() {
            if (this.currentSection === 0) {
                return this.activities
            } else {
                return this.groupBy(this.sections[this.currentSection], 'type')
            }
        },
    },

    methods: {
        calculateSectionProgress (section) {
            const sum = section.filter(({ completion }) => completion === 1 ).length
            const total = section.length
            return Math.floor(sum/total*100)
        },

        onClick (type, activity) {
            for (var j = 0; j < this.sections.length; j++) {
                var section = this.sections[j];
                for (var i = 0; i < section.length; i++) {
                    if (this.sections[j][i].id === activity.id) {
                        this.sections[j][i].completion = 1
                    }
                }
            }

            for (var z = 0; z < this.activities[type].length; z++) {
                if (this.activities[type][z].id === activity.id) {
                    this.activities[type][z].completion = 1
                }
            }
        },

        calculateWidth(items) {
            return 100 / (items - 1)
        },

        getTotalActivites () {
            const y = this.sections.map(a => a.length)
            return y.reduce((total, current) => {
                return total + current;
            }, 0)
        },

        setSection(index) {
            this.currentSection = index
            this.currentActivities = this.getCurrentActivities
        },

        setCurrent: function (id, section) {
            this.current = { id: id, section: section };
            // this.$emit('log', 'dashboard_completion_item_hover', { url: this.getLink(), completion: this.getCurrent().completion });
        },

        // getCurrent: function () {
        //     return this.sections[this.currentSection][this.current.id];
        // },
        //
        // getLink: function (instance) {
        //     instance = instance == undefined ? this.getCurrent() : instance;
        //     return M.cfg.wwwroot + '/mod/' + instance.type + '/view.php?id=' + instance.id;
        // },

        getPopoverContent (type, activity) {
            const x = this.activities[type];
            for (var j = 0; j < x.length; j++) {
                if (x[j].id === activity.id) {
                    return `Hallo ${x[j].name}`
                }
            }
        },

        loadCourseData: async function () {
            const response = await Communication.webservice(
              'overview',
              { courseid: this.$store.getters.getCourseid }
            );
            if (response.success) {
                response.data = JSON.parse(response.data)
                console.log('input debug::', JSON.parse(response.data.debug));
                console.log('input completions::', JSON.parse(response.data.completions));

                this.sections = this.groupBy(JSON.parse(response.data.completions), 'section');
                console.log('sections', this.sections)
                console.log('stats', this.calcStats())
                this.stats = this.calcStats();

                this.activities = this.groupBy(JSON.parse(response.data.completions), 'type');
                this.currentActivities = this.activities
                this.total = this.getTotalActivites()
                console.log('activities', this.activities)
                console.log("section names: ", this.sectionnames)

                this.activityNames = Object.keys(this.activities)
            } else {
                if (response.data) {
                  console.log('Faulty response of webservice /overview/', response.data);
                } else {
                  console.log('No connection to webservice /overview/');
                }
            }
        },

        groupBy: function (data, key) {
            var arr = [];
            for (var val in data) {
                arr[data[val][key]] = arr[data[val][key]] || [];
                arr[data[val][key]].push(data[val]);
            }

            if (arr.length > 1) {
                return arr.filter(function (el) {
                    return el !== null;
                });
            }
            else {
                return arr;
            }

        },

        calcStats: function () {
            let stats = [];
            for (var j = 0; j < this.sections.length; j++) {
                var section = this.sections[j];
                for (var i = 0; i < section.length; i++) {
                    if (section[i].visible == '0') {
                        continue;
                    }
                    if (stats[section[i].section] == undefined) {
                        stats[section[i].section] = {};
                    }
                    if (stats[section[i].section][section[i].type] == undefined) {
                        this.sectionnames[section[i].section] = section[i].sectionname
                        stats[section[i].section][section[i].type] = {
                            type: section[i].type,
                            count: 0,
                            achieved_score: 0,
                            max_score: 0,
                            complete: 0
                        };
                    }
                    section[i].count = section[i].count == undefined ? 1 : section[i].count;
                    if (section[i].type == "longpage" || section[i].type == "hypervideo") {
                        stats[section[i].section][section[i].type].count += parseInt(section[i].count, 10);
                        stats[section[i].section][section[i].type].complete += section[i].complete != undefined ? parseInt(section[i].complete, 10) : 0;
                    } else {
                        stats[section[i].section][section[i].type].count = section[i].type == "assign" ? parseInt(section[i].count, 10) : stats[section[i].section][section[i].type].count + 1;
                        stats[section[i].section][section[i].type].complete += section[i].submission_time != null ? 1 : 0;

                        stats[section[i].section][section[i].type].achieved_score += section[i].achieved_score != null ? parseInt(section[i].achieved_score, 10) : 0;
                        stats[section[i].section][section[i].type].max_score += section[i].max_score != null ? parseInt(section[i].max_score, 10) : 0;
                    }
                }
            }
            stats = stats.filter(function (n) { return n; });
            this.sectionnames = this.sectionnames.filter(function (n) { return n; });
            //
            let out = [];
            let sum = {
                hypervideo: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                longpage: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                quiz: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                assign: { count: 0, complete: 0, achieved_score: 0, max_score: 0 }
            };
            for (var i = 0; i < stats.length; i++) {
                var el = {
                    sectionname: this.sectionnames[i].replace(':', ':\n'),
                    id: i
                };
                if (stats[i] == null) {
                    continue;
                }
                if (stats[i].hypervideo) {
                    el.hypervideo = {
                        count: stats[i].hypervideo.count,
                        complete: stats[i].hypervideo.complete
                    }
                    sum.hypervideo.count += stats[i].hypervideo.count;
                    sum.hypervideo.complete += isNaN(stats[i].hypervideo.complete) ? stats[i].hypervideo.complete : 0;
                }
                if (stats[i].longpage) {
                    el.longpage = {
                        count: stats[i].longpage.count,
                        complete: stats[i].longpage.complete
                    }
                    sum.longpage.count += stats[i].longpage.count;
                    sum.longpage.complete += stats[i].longpage.complete;
                }
                if (stats[i].quiz) {
                    el.quiz = {
                        count: stats[i].quiz.count,
                        complete: stats[i].quiz.complete,
                        achieved_score: stats[i].quiz.achieved_score,
                        max_score: stats[i].quiz.max_score
                    }
                    sum.quiz.count += stats[i].quiz.count;
                    sum.quiz.complete += stats[i].quiz.complete;
                    sum.quiz.achieved_score += stats[i].quiz.achieved_score;
                    sum.quiz.max_score += stats[i].quiz.max_score;
                }
                if (stats[i].assign) {
                    el.assign = {
                        count: stats[i].assign.count,
                        complete: stats[i].assign.complete,
                        achieved_score: stats[i].assign.achieved_score,
                        max_score: stats[i].assign.max_score
                    };
                    sum.assign.count += stats[i].assign.count;
                    sum.assign.complete += stats[i].assign.complete;
                    sum.assign.achieved_score += stats[i].assign.achieved_score;
                    sum.assign.max_score += stats[i].assign.max_score;
                }

                out.push(el);
            }
            this.sumScores = sum;
            return out;
        },
  },

}
</script>

<style lang="scss" scoped>
.subject-progress {
    &__popover {
        border: none;
        padding: 0;
        background: none;
    }
}

    .completion-rect {
        stroke-width: 3px;
        stroke: white;
        width: 20px;
        height: 18px;
        display: inline-block;
        opacity: 0.7;
        margin-right: 1px;
    }

    .rect-blue {
        background-color: #136aaf;
    }

    .rect-green {
        background-color: #89da59;
    }

    .completion-rect:hover {
        stroke-width: 3px;
        stroke: white;
        opacity: 1;
    }

    .progressbar {
        width: 100%;
        height: 40px;
    }

    .section-names {
        white-space: nowrap;
        overflow: hidden !important;
        text-overflow: ellipsis;
    }

    .section-selection {
        cursor: pointer;
        margin: 2px;

        &:hover {
            text-decoration: underline;
            outline: 2px solid #5A97C7;
            outline-offset: 2px;
        }

        &--current {
            text-decoration: underline;
            outline: 2px solid #5A97C7;
            outline-offset: 2px;
        }
    }
</style>