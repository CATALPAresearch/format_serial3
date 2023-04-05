<template>
    <div>
        <widget-heading icon="fa-balance-scale" info-content="Informationen über das Widget"
                        title="Lernziele"></widget-heading>
        <div class="form-group d-flex align-items-center pr-3">
            <label class="pr-2 m-0 flex-shrink-0" for="select-goal">Mein Ziel für diesen Kurs ist: </label>
            <select
                id="select-goal"
                class="form-control form-select"
                @change="switchGoal($event)"
            >
                <option :selected="currentGoal==='mastery'" value="mastery">den Kurs zu meistern</option>
                <option :selected="currentGoal==='passing'" value="passing">den Kurs zu bestehen</option>
                <option :selected="currentGoal==='overview'" value="overview">einen Überblick zu bekommen</option>
                <option :selected="currentGoal==='practice'" value="practice">praktisches/job-relevantes Wissen
                    anzueignen
                </option>
            </select>
        </div>
        <div class="d-flex mt-3">
            <div class="dropdown">
                <button
                    id="dropdownMenuButton"
                    aria-expanded="false"
                    aria-haspopup="true"
                    class="btn btn-secondary dropdown-toggle"
                    data-toggle="dropdown"
                    type="button"
                >Indikatoren</button>
                <ul aria-labelledby="dropdownMenuButton" class="dropdown-menu" @change="selectIndicators">
                    <li v-for="(indicator, index ) in indicators" :key="index">
                        <div class="form-check ml-2">
                            <input
                                :id="index"
                                class="form-check-input"
                                type="checkbox"
                                :value="indicator.value"
                                v-model="indicator.checked"
                            />
                            <label :for="index" class="form-check-label">{{
                                    indicator.title
                                }}</label>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div ref="bulletChart" class="bullet-chart mt-3"></div>
    </div>
</template>

<script>
import * as d3 from "../../js/d3.min.js";
import "../../js/bullet.js";

import WidgetHeading from "../WidgetHeading.vue";
import {mapActions, mapGetters, mapState} from "vuex";


export default {
    name: "IndicatorDisplay",

    components: {WidgetHeading},

    props: {
        width: {
            type: Number,
            default: 300,
        },
        height: {
            type: Number,
            default: 50,
        },
    },

    data: function () {
        return {
            currentGoal: null,
            selectedIndicators: ['Kompetenz', 'Wissensstand', 'Ergebnisse', 'Time Management', 'Soziale Interaktion'],
            indicators: [
                {value: 'Kompetenz', title: 'Kompetenz', checked: true},
                {value: 'Wissensstand', title: 'Wissensstand', checked: true},
                {value: 'Ergebnisse', title: 'Ergebnisse', checked: true},
                {value: 'Time Management', title: 'Time Management', checked: true},
                {value: 'Soziale Interaktion', title: 'Soziale Interaktion', checked: true},
            ],
            data: [
                {
                    title: 'Wissensstand',
                    subtitle: 'in %',
                    ranges: [],
                    measures: [],
                },
                {
                    title: 'Kompetenz',
                    subtitle: 'in %',
                    ranges: [],
                    measures: [],
                },
                {
                    title: 'Ergebnisse',
                    subtitle: 'Gesamtpunktzahl',
                    ranges: [],
                    measures: [],
                },
                {
                    title: 'Time Management',
                    subtitle: 'in %',
                    ranges: [],
                    measures: [],
                },
                {
                    title: 'Soziale Interaktion',
                    subtitle: 'in %',
                    ranges: [],
                    measures: [],
                },
            ],
            rangesGrades: {
                'mastery': [],
                'passing': [],
                'overview': [],
                'practice': [],
            },
            rangesProficiency: {
                'mastery': [50, 75, 100],
                'passing': [35, 50, 100],
                'overview': [15, 30, 100],
                'practice': [45, 65, 100],
            },
            rangesProgress: {
                'mastery': [55, 85, 100],
                'passing': [40, 70, 100],
                'overview': [20, 33, 100],
                'practice': [45, 60, 100],
            },
            rangesTime: {
                'mastery': [55, 85, 100],
                'passing': [40, 70, 100],
                'overview': [20, 33, 100],
                'practice': [45, 60, 100],
            },
            rangesSocial: {
                'mastery': [55, 85, 100],
                'passing': [40, 70, 100],
                'overview': [20, 33, 100],
                'practice': [45, 60, 100],
            },
        }
    },

    mounted() {
        this.calculateUnderstanding();
        this.calculateTopicProficiency();
        this.fetchCurrentGoal();
        this.calculateTimeManagement();
        this.currentGoal = this.getCurrentGoal();
    },

    watch: {
        filteredData: {
            deep: true,
            handler() {
                this.drawChart();
            },
        },
        timeliness: {
            deep: true,
            handler() {
                this.drawChart();
            },
        },
        socialActivity: {
            deep: true,
            handler() {
                console.log("social gets updated")
                this.data.find((d) => d.title === 'Soziale Interaktion').measures = [this.socialActivity]
                this.drawChart();
            },
        },
        userGrade: {
            deep: true,
            handler() {
                this.calculateGrades();
                this.drawChart();
            },
        },
        totalGrade: {
            deep: true,
            handler() {
                this.drawChart();
            },
        },
        progressUnderstanding: {
            deep: true,
            handler() {
                this.calculateUnderstanding();
                this.drawChart();
            },
        },
        mastery: {
            deep: true,
            handler() {
                this.calculateTopicProficiency();
                this.drawChart();
            },
        },
    },

    computed: {
        filteredData() {
            return this.data.filter((indicator) => this.selectedIndicators.includes(indicator.title))
        },

        ...mapState({
            timeliness: state => state.learnermodel.timeManagement,
            socialActivity: state => state.learnermodel.socialActivity,
            userGrade: state => state.learnermodel.userGrade,
            totalGrade: state => state.learnermodel.totalGrade,
            progressUnderstanding: state => state.learnermodel.progressUnderstanding,
            mastery: state => state.learnermodel.mastery,
            strings: 'strings'
        }),
    },

    methods: {
        ...mapGetters(['getCurrentGoal']),
        ...mapActions(['updateCurrentGoal', 'fetchCurrentGoal']),

        switchGoal: async function (event) {
            await this.updateCurrentGoal(event.target.value);
            this.updateRanges(event.target.value);
            this.$forceUpdate();
        },

        selectIndicators(event) {
            const selectedIndicators = [];
            const checkboxes = event.currentTarget.querySelectorAll('li input[type="checkbox"]:checked');

            checkboxes.forEach((checkbox) => {
                selectedIndicators.push(checkbox.value);
            });

            this.selectedIndicators = selectedIndicators;
        },

        updateRanges(selectedGoal) {
            // Find the data object for the proficiency indicator
            let proficiencyData = this.data.find((d) => d.title === 'Kompetenz');
            let progressData = this.data.find((d) => d.title === 'Wissensstand');
            let gradesData = this.data.find((d) => d.title === 'Ergebnisse');
            let timeData = this.data.find((d) => d.title === 'Time Management');
            let socialData = this.data.find((d) => d.title === 'Soziale Interaktion');

            // Update the ranges based on the selected goal
            switch (selectedGoal) {
                case 'mastery':
                    proficiencyData.ranges = this.rangesProficiency.mastery;
                    progressData.ranges = this.rangesProgress.mastery;
                    gradesData.ranges = this.rangesGrades.mastery;
                    timeData.ranges = this.rangesTime.mastery;
                    socialData.ranges = this.rangesSocial.mastery;
                    break;
                case 'passing':
                    proficiencyData.ranges = this.rangesProficiency.passing;
                    progressData.ranges = this.rangesProgress.passing;
                    gradesData.ranges = this.rangesGrades.passing;
                    timeData.ranges = this.rangesTime.passing;
                    socialData.ranges = this.rangesSocial.passing;
                    break;
                case 'overview':
                    proficiencyData.ranges = this.rangesProficiency.overview;
                    progressData.ranges = this.rangesProgress.overview;
                    gradesData.ranges = this.rangesGrades.overview;
                    timeData.ranges = this.rangesTime.overview;
                    socialData.ranges = this.rangesSocial.overview;
                    break;
                case 'practice':
                    proficiencyData.ranges = this.rangesProficiency.practice;
                    progressData.ranges = this.rangesProgress.practice;
                    progressData.ranges = this.rangesGrades.practice;
                    timeData.ranges = this.rangesTime.practice;
                    socialData.ranges = this.rangesSocial.practice;
                    break;
            }
        },

        /**
         * Calculates the users progress in the course based on their understanding of the topics.
         * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points
         * one can achieve in total in the course.
         */
        calculateUnderstanding() {
            this.data.find((d) => d.title === 'Wissensstand').measures = [this.progressUnderstanding]
        },

        /**
         * Calculates the users understanding of the topics.
         * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points one
         * can achieve in the topics covered so far
         */
        calculateTopicProficiency() {
            this.data.find((d) => d.title === 'Kompetenz').measures = [this.mastery]
        },

        calculateGrades() {
            this.data.find((d) => d.title === 'Ergebnisse').measures = [this.userGrade]
            this.rangesGrades.mastery = [this.totalGrade * 0.5, this.totalGrade * 0.75, this.totalGrade]
            this.rangesGrades.passing = [this.totalGrade * 0.3, this.totalGrade * 0.66, this.totalGrade]
            this.rangesGrades.practice = [this.totalGrade * 0.5, this.totalGrade * 0.75, this.totalGrade]
            this.rangesGrades.overview = [this.totalGrade * 0.2, this.totalGrade * 0.5, this.totalGrade]
            this.updateRanges(this.currentGoal);
        },

        calculateTimeManagement() {
            this.data.find((d) => d.title === 'Time Management').measures = [this.timeliness]
        },

        drawChart() {
            console.log('inidcator data: ', this.filteredData)
            var margin = {top: 5, right: 40, bottom: 50, left: 120},
                width = 520 - margin.left - margin.right,
                height = 50;

            d3.select(this.$refs.bulletChart).selectAll('svg').remove()

            var chart = d3.bullet()
                .width(width)
                .height(height);

            var svg = d3.select(this.$refs.bulletChart)
                .selectAll('svg')
                .data(this.filteredData)
                .enter()
                .append('svg')
                .attr('class', 'bullet')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(chart)

            var title = svg.append('g')
                .style('text-anchor', 'end')
                .attr('transform', 'translate(-10,' + height / 4 + ')');

            title.append('text')
                .attr('class', 'title')
                .text(function (d) {
                    return d.title;
                });

            title.append('text')
                .attr('class', 'subtitle')
                .attr('dy', '1em')
                .text(function (d) {
                    return d.subtitle;
                });
        }
    },
}
</script>

<style lang="scss">
@import "../../scss/variables.scss";

select.form-control {
    appearance: menulist-button !important;
}

.bullet {
    margin: 10px 0;
}

.bullet {
    font: 10px sans-serif;
    margin-left: auto;
    margin-right: auto;
}

.bullet .marker {
    stroke: #4D4D4D;
    stroke-width: 2px;
}

.bullet .range.s0 {
    fill: $blue-dark;
    opacity: 0.6;
}

.bullet .range.s1 {
    fill: $blue-middle;
    opacity: 0.6;
}

.bullet .range.s2 {
    fill: $blue-weak;
    opacity: 0.6;
}

.bullet .measure.s0 {
    fill: $blue-dark;
}

.bullet .title {
    font-size: 12px;
    font-weight: bold;
}

.bullet .subtitle.s04 {
    fill: #000000;
    font-size: 16px;
    font-weight: bold;
}

.bullet .subtitle.s13 {
    fill: #999999;
    font-size: 12px;
    font-weight: bold;
}

.bullet .subtitle.s2 {
    fill: #999999;
    font-size: 10px;
}
</style>