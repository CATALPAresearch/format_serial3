<template>
    <div>
        <widget-heading title="Progress" icon="fa-hourglass-o" :info-content="info"></widget-heading>
        <div id="dashboard-completion">
            <div class="section-selection mr-2" :class="currentSection === -1 ? 'section-selection--current' : ''" @click="setCurrentSection(-1)">
                <p class="my-1">Alle</p>
                <div class="progress mb-2">
                    <div class="progress-bar progress-bar-blue" role="progressbar" :style="{'width': calculateProgress + '%'}" :aria-valuenow="calculateProgress" aria-valuemin="0" aria-valuemax="100">{{ calculateProgress }}%</div>
                </div>
            </div>

            <div class="w-100 mb-4">
                <div v-for="(section, index) in getSections" :key="index" :style="{'width': calculateWidth(getSections.length) + '%'}" class="d-inline-block" @click="setCurrentSection(index)">
                    <div class="section-selection mr-2" :class="currentSection === index ? 'section-selection--current' : ''">
                        <p class="section-names mb-1 small" :title="section[0].sectionname">{{ section[0].sectionname }}</p>
                        <div class="progress">
                            <div class="progress-bar progress-bar-blue" role="progressbar" :style="{'width': calculateSectionProgress(section) + '%'}" :aria-valuenow="calculateSectionProgress(section)" aria-valuemin="0" aria-valuemax="100">{{ calculateSectionProgress(section) }}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-for="(type, aIndex) in activityNames" :key="aIndex" class="row">
                <span class="col-3">{{ getActivities[type][0].modulename }}</span>
                <div class="col-9">
                    <span v-for="(activity, aCount) in currentActivities[type]" :key="aCount" class="position-relative">
                         <button ref="popoverButton" type="button" data-toggle="popover" data-placement="bottom" class="panel-heading subject-progress__popover" :title="activity.name" v-popover-html="popoverContent(activity)">
                            <span class="completion-rect" :class="{
                                    'rect-grey': activity.rating === 0,
                                    'rect-red': activity.rating === 1,
                                    'rect-blue':  activity.rating === 2,
                                    'rect-green': activity.rating === 3
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
import Vue from 'vue';
import { mapActions, mapGetters, mapState  } from 'vuex';
import {groupBy} from "../../scripts/util";


export default {
    name: "ProgressChart",

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
            info: 'Informationen über das Widget',
            sectionnames: [],
            stats: [],
            popoverComponent: null
        };
    },

    watch: {
        currentSection: function(val) {
            if (val === -1) {
                this.$store.commit('progress/setCurrentActivities', this.getActivities);
            } else {
                this.$store.commit('progress/setCurrentActivities', groupBy(this.getSections[this.currentSection], 'type'));
            }
        },
    },

    created() {
        import('../PopoverContent.vue').then(component => {
            this.popoverComponent = Vue.extend(component.default);
        });
    },

    mounted: async function () {
       await this.loadCourseData()
    },

    computed: {
        calculateProgress() {
            const x = this.getSections.map(a => a.filter(({ completion }) => completion === 1 ).length)
            const sum = x.reduce((total, current) => {
                return total + current;
            }, 0)
            const total = this.getTotalActivites()
            return Math.floor(sum/total*100)
        },

        ...mapState('progress', ['currentSection', 'sections', 'courseData', 'activityNames', 'currentActivities']),
        ...mapGetters('progress', ['getSections', 'getActivities', 'getCurrentActivities']),
    },

    methods: {
        ...mapActions('taskList', ['addItem']),

        popoverContent (activity) {
            if (this.popoverComponent) {
                const PopoverComponent = Vue.extend(this.popoverComponent)
                const popover = new PopoverComponent({
                    propsData: {
                        activity: activity
                    }
                }).$mount()

                popover.$on('completion-updated', (completionStatus, activityId) => {
                    this.courseData[activityId].completion = completionStatus ? 1 : 0
                });

                popover.$on('understanding-updated', (understanding, activityId) => {
                    this.courseData[activityId].rating = Number(understanding)
                    this.courseData[activityId].completion = 1
                })

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

        calculateWidth(items) {
            return 100 / items
        },

        getTotalActivites () {
            const y = this.getSections.map(a => a.length)
            return y.reduce((total, current) => {
                return total + current;
            }, 0)
        },

        setCurrentSection(section) {
            this.$store.commit('progress/setCurrentSection', section);
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

                this.$store.commit('progress/setCourseData', JSON.parse(response.data.completions))
                this.$store.commit('progress/setCurrentActivities', this.getActivities);
                this.$store.commit('progress/setActivityNames', Object.keys(this.getActivities))
                this.total = this.getTotalActivites()
            } else {
                if (response.data) {
                  console.log('Faulty response of webservice /overview/', response.data);
                } else {
                  console.log('No connection to webservice /overview/');
                }
            }

            const res = await Communication.webservice(
            'getUserUnderstanding',
             { course: this.$store.getters.getCourseid }
            );

            const completionData = JSON.parse(res.data)
            for (let key in completionData) {
                let activityid = completionData[key]['activityid'];
                this.courseData[activityid]['completion'] = Number(completionData[key]['completed']);
                this.courseData[activityid]['rating'] = Number(completionData[key]['rating']);
            }
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

.progress-bar-blue {
    background-color: #136aaf;
    opacity: 0.6;
}

    .completion-rect {
        stroke-width: 3px;
        stroke: white;
        width: 20px;
        height: 18px;
        display: inline-block;
        opacity: 0.6;
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

    .rect-red {
        background-color: #E18686;
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