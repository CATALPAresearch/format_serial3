<template>
    <div>
        <widget-heading title="Progress" icon="fa-hourglass-o" :info-content="info"></widget-heading>
        <div id="dashboard-completion">
            <div class="section-selection mr-2" :class="currentSection === -1 ? 'section-selection--current' : ''" @click="setCurrentSection(-1)">
                <p class="my-1">All</p>
                <div class="progress mb-2">
                    <div class="progress-bar" role="progressbar" :style="{'width': calculateProgress + '%'}" :aria-valuenow="calculateProgress" aria-valuemin="0" aria-valuemax="100">{{ calculateProgress }}%</div>
                </div>
            </div>

            <div class="w-100 mb-4">
                <div v-for="(section, index) in allSections" :key="index" :style="{'width': calculateWidth(allSections.length) + '%'}" class="d-inline-block" @click="setCurrentSection(index)">
                    <div class="section-selection mr-2" :class="currentSection === index ? 'section-selection--current' : ''">
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
                    <span v-for="(activity, aCount) in currentActivities[type]" :key="aCount" class="position-relative">
                         <button type="button" data-toggle="popover" data-placement="bottom" class="panel-heading subject-progress__popover" :title="activity.name" v-popover-html="popoverContent(type, activity)">
                            <span :class="{
                                    'rect-grey completion-rect': activity.completion === 0,
                                    'rect-blue completion-rect': activity.completion === 1,
                                    'rect-yellow completion-rect': activity.rating === 2,
                                    'rect-green completion-rect': activity.rating === 3
                                }" :title="activity.name"></span>
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
import PopoverContent from "../PopoverContent.vue";
import Vue from 'vue';
import { mapActions, mapGetters, mapState  } from 'vuex';
import $ from 'jquery';
// const $ = require("jquery");


export default {
    name: "SubjectProgress",

    components: { WidgetHeading },

    directives: {
        popoverHtml: {
            bind: function(el, binding) {
                $(el).popover({
                    html: true,
                    sanitize: false,
                    content: function() {
                        return binding.value;
                    }
                });


                $(el).on('shown.bs.popover', function() {
                    var popover = $(el).siblings('.popover');
                    popover.on('click', function(event) {
                        event.stopPropagation();
                    });

                    $(document).on('click.popover', function(event) {
                        var isClickInsidePopover = $(event.target).closest('.popover').length > 0;
                        var isClickOnPopoverButton = $(event.target).is($(el));
                        if (!isClickInsidePopover && !isClickOnPopoverButton) {
                            $(el).popover('hide');
                            $(document).off('click.popover');
                        }
                    });
                });

                $(el).on('hidden.bs.popover', function() {
                    var popover = $(el).siblings('.popover');
                    popover.off('click');
                });
            },
            unbind: function(el) {
                $(el).popover('dispose');
                $(el).off('shown.bs.popover');
                $(el).off('hidden.bs.popover');
            }
        }
    },

    data: function () {
        return {
            total: 0,
            activities: null,
            currentActivities: null,
            info: 'Informationen über das Widget',
            sectionnames: [],
            activityNames: [],
            stats: [],
            sumScores: {
                longpage: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                quiz: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                assign: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                hypervideo: { count: 0, complete: 0, achieved_score: 0, max_score: 0 }
            },
            popoverComponent: null
        };
    },

    watch: {
        currentSection: function(val) {
            if (val === -1) {
                this.currentActivities = this.activities;
            } else {
                this.currentActivities = this.groupBy(this.allSections[this.currentSection], 'type')
            }
        }
    },

    mounted: function () {
        this.loadCourseData();

        import('../PopoverContent.vue').then(component => {
            this.popoverComponent = Vue.extend(component.default);
        });
    },

    computed: {
        calculateProgress() {
            const x = this.allSections.map(a => a.filter(({ completion }) => completion === 1 ).length)
            const sum = x.reduce((total, current) => {
                return total + current;
            }, 0)

            return Math.floor(sum/this.total*100)
        },

        ...mapState(['currentSection', 'allSections', 'sectionNames']),
        ...mapGetters(['getCurrentSection', 'getAllSections', 'getSectionNames']),
    },

    methods: {
        ...mapActions('taskList', ['addItem']),

        popoverContent (type, activity) {
            if (this.popoverComponent) {
                const PopoverComponent = Vue.extend(this.popoverComponent)
                const popover = new PopoverComponent({
                    propsData: {
                        activity: activity
                    }
                }).$mount()

                popover.$on('completion-updated', completionStatus => {
                    for (var j = 0; j < this.allSections.length; j++) {
                        var section = this.allSections[j];
                        for (var i = 0; i < section.length; i++) {
                            if (this.allSections[j][i].id === activity.id) {
                                this.allSections[j][i].completion = completionStatus ? 1 : 0
                            }
                        }
                    }

                    for (var z = 0; z < this.activities[type].length; z++) {
                        if (this.activities[type][z].id === activity.id) {
                            this.activities[type][z].completion = completionStatus ? 1 : 0
                        }
                    }
                });

                popover.$on('add-to-task-list', task => {
                    this.addItem(task)
                });

                return popover.$el
            }
        },

        calculateSectionProgress (section) {
            const sum = section.filter(({ completion }) => completion === 1 ).length
            const total = section.length
            return Math.floor(sum/total*100)
        },

        onClick (type, activity) {
            for (var j = 0; j < this.allSections.length; j++) {
                var section = this.allSections[j];
                for (var i = 0; i < section.length; i++) {
                    if (this.allSections[j][i].id === activity.id) {
                        this.allSections[j][i].completion = 1
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
            return 100 / items
        },

        getTotalActivites () {
            const y = this.allSections.map(a => a.length)
            return y.reduce((total, current) => {
                return total + current;
            }, 0)
        },

        setCurrentSection(section) {
            this.$store.commit('setCurrentSection', section);
        },

        // setCurrent: function (id, section) {
        //     this.current = { id: id, section: section };
        //     // this.$emit('log', 'dashboard_completion_item_hover', { url: this.getLink(), completion: this.getCurrent().completion });
        // },

        // getCurrent: function () {
        //     return this.sections[this.currentSection][this.current.id];
        // },

        loadCourseData: async function () {
            const response = await Communication.webservice(
              'overview',
              { courseid: this.$store.getters.getCourseid }
            );
            if (response.success) {
                response.data = JSON.parse(response.data)
                console.log('input debug::', JSON.parse(response.data.debug));
                console.log('input completions::', JSON.parse(response.data.completions));

                const sections = this.groupBy(JSON.parse(response.data.completions), 'section');
                this.$store.commit('setAllSections', sections);
                console.log('sections', this.allSections)
                console.log('stats', this.calcStats())
                this.stats = this.calcStats();

                const sectionNames = this.stats.map(obj => ({
                    id: obj.id,
                    name: obj.sectionname
                }))

                this.$store.commit('setSectionNames', sectionNames);
                console.log('sectionNames: ', this.sectionNames)

                this.activities = this.groupBy(JSON.parse(response.data.completions), 'type');
                this.currentActivities = this.activities
                this.total = this.getTotalActivites()
                console.log('activities', this.activities)

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
            for (var j = 0; j < this.allSections.length; j++) {
                var section = this.allSections[j];
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

    .rect-grey {
        background-color: #CED4DA;
    }

    .rect-blue {
        background-color: #136aaf;
    }

    .rect-green {
        background-color: #89da59;
    }

    .rect-yellow {
        background-color: yellow;
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

.button {
    border: none;
    background: none;
    padding: 0;
}

.container {
    margin-top: 10px;
}
.my-popover-content {
    display:none;
}
</style>