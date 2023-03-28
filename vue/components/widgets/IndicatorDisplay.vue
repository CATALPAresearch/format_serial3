<template>
    <div>
        <widget-heading title="Lernziele" icon="fa-balance-scale" info-content="Informationen über das Widget"></widget-heading>
        <div class="form-group d-flex align-items-center pr-3">
            <label for="select-goal" class="pr-2 m-0 flex-shrink-0">Mein Ziel für diesen Kurs ist: </label>
            <select
                id="select-goal"
                class="form-control form-select"
                aria-label=""
                @change="switchGoal($event)"
            >
                <option :selected="currentGoal==='mastery'" value="mastery">den Kurs zu meistern</option>
                <option :selected="currentGoal==='passing'" value="passing">den Kurs zu bestehen</option>
                <option :selected="currentGoal==='overview'" value="overview">einen Überblick zu bekommen</option>
                <option :selected="currentGoal==='practise'" value="practise">praktisches/job-relevantes Wissen anzueignen</option>
            </select>
        </div>
        <div class="d-flex mt-3">
            <div class="dropdown">
                <button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >Indikatoren</button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton"  @change="selectIndicators">
                    <li v-for="(indicator, index ) in indicators" :key="index">
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" :value="indicator.value" :id="index" :checked="indicator.checked" />
                                <label class="form-check-label" :for="index">{{ indicator.title }}</label>
                            </div>
                        </a>
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
import Communication from "../../scripts/communication";
import {ajax} from "../../store/store";


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
            userUnderstanding: null,
            userGrades: null,
            learnergoals: [],
            currentGoal: 'mastery',
            selectedIndicators: ['Kompetenz', 'Fortschritt', 'Ergebnisse'],
            indicators: [
                { value: 'Kompetenz', title: 'Kompetenz', checked: true },
                { value: 'Fortschritt', title: 'Fortschritt', checked: true },
                { value: 'Ergebnisse', title: 'Ergebnisse', checked: true },
            ],
            data: [
                {
                    title: 'Fortschritt',
                    subtitle: "in %",
                    ranges: [],
                    measures: [],
                    // markers: [21],
                },
                {
                    title:"Kompetenz",
                    subtitle: "in %",
                    ranges: [],
                    measures: [],
                    // markers: [44]
                },
                {
                    title:"Ergebnisse",
                    subtitle: "Gesamtpunktzahl",
                    ranges: [],
                    measures: [],
                    // markers: [44]
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
            }
        }
    },

    mounted() {
        this.loadUserUnderstanding();
        this.calculateGrades();
    },

    watch: {
        filteredData: {
            deep: true,
            handler() {
                this.drawChart();
            },
        },
    },

    computed: {
        filteredData() {
            return this.data.filter((indicator) => this.selectedIndicators.includes(indicator.title))
        }
    },

    methods: {
        switchGoal: async function (event) {
            const now = new Date();
            const response = await Communication.webservice(
                'logger',
                {
                    'data': {
                        'courseid': parseInt(this.$store.getters.getCourseid, 10),
                        'utc': parseInt(now.getTime(), 10),
                        'action': 'change_goal',
                        'entry': JSON.stringify({ form: this.currentGoal, to: event.target.value })
                    }
                }
            );
            if (!response.success) {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
            this.currentGoal = event.target.value;
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
            let progressData = this.data.find((d) => d.title === 'Fortschritt');
            let gradesData = this.data.find((d) => d.title === 'Ergebnisse');

            // Update the ranges based on the selected goal
            switch (selectedGoal) {
                case 'mastery':
                    proficiencyData.ranges = this.rangesProficiency.mastery;
                    progressData.ranges = this.rangesProgress.mastery;
                    gradesData.ranges = this.rangesGrades.mastery;
                    break;
                case 'passing':
                    proficiencyData.ranges = this.rangesProficiency.passing;
                    progressData.ranges = this.rangesProgress.passing;
                    gradesData.ranges = this.rangesGrades.passing;
                    break;
                case 'overview':
                    proficiencyData.ranges = this.rangesProficiency.overview;
                    progressData.ranges = this.rangesProgress.passing;
                    gradesData.ranges = this.rangesGrades.passing;
                    break;
                case 'practise':
                    proficiencyData.ranges = this.rangesProficiency.practice;
                    progressData.ranges = this.rangesProgress.passing;
                    progressData.ranges = this.rangesGrades.passing;
                    break;
            }
        },

        /**
         * Fetches data for each user about their understanding of the course.
         */
        async loadUserUnderstanding () {
            const response = await Communication.webservice(
                'getUserUnderstanding',
                { course: this.$store.getters.getCourseid }
            );

            if (response.success) {
                this.userUnderstanding = JSON.parse(response.data)
                this.calculateUnderstanding();
                this.calculateTopicProficiency();
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        /**
         * Calculates the users progress in the course based on their understanding of the topics.
         * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points
         * one can achieve in total in the course.
         */
        calculateUnderstanding () {
            const total = this.$store.getters['overview/getTotalNumberOfActivities'] * 3
            const user = Object.values(this.userUnderstanding).reduce((acc, cur) => acc + Number(cur.rating), 0);
            this.data.find((d) => d.title === 'Fortschritt').measures = [user/total * 100]
        },

        /**
         * Calculates the users understanding of the topics.
         * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points one
         * can achieve in the topics covered so far
         */
        calculateTopicProficiency () {
            const length = Object.keys(this.userUnderstanding).length
            const total = length * 3
            const user = Object.values(this.userUnderstanding).reduce((acc, cur) => acc + Number(cur.rating), 0);
            this.data.find((d) => d.title === 'Kompetenz').measures = [user/total * 100]
        },

        async calculateGrades () {
            let quizzes = await Communication.webservice(
                'getQuizzes',
                { course: this.$store.getters.getCourseid, userid: 3 }
            );

            if (quizzes.success) {
                quizzes = JSON.parse(quizzes.data)
            } else {
                if (quizzes.data) {
                    console.log('Faulty response of webservice /logger/', quizzes.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }

            let assignments = await Communication.webservice(
                'getAssignments',
                {
                    userid: 3,
                    course: 4,
                }
            );

            if (assignments.success) {
                assignments = JSON.parse(assignments.data)
            } else {
                if (assignments.data) {
                    console.log('Faulty response of webservice /logger/', assignments.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }

            this.userGrades = [...Object.values(quizzes), ...Object.values(assignments)]

            const totalPoints = this.userGrades.reduce((sum, item) => {
                return sum + Number(item.max_grade);
            }, 0);

            const userPoints = this.userGrades.reduce((sum, item) => {
                return sum + Number(item.user_grade);
            }, 0);

            this.data.find((d) => d.title === 'Ergebnisse').measures = [userPoints]
            this.rangesGrades.mastery = [totalPoints * 0.5, totalPoints * 0.75, totalPoints]
            this.rangesGrades.passing = [totalPoints * 0.3, totalPoints * 0.66, totalPoints]
            this.rangesGrades.practise = [totalPoints * 0.5, totalPoints * 0.75, totalPoints]
            this.rangesGrades.overview = [totalPoints * 0.2, totalPoints * 0.5, totalPoints]
            this.updateRanges(this.currentGoal);
        },

        calculateSocialInteraction () {
            // @TODO
        },

        calculateTimeliness () {
            // @TODO
        },

        drawChart () {
            var margin = {top: 5, right: 40, bottom: 50, left: 120},
                width = 600 - margin.left - margin.right,
                height = 50;

            d3.select(this.$refs.bulletChart).selectAll("svg").remove()

            var chart = d3.bullet()
                .width(width)
                .height(height);

            var svg = d3.select(this.$refs.bulletChart)
                .selectAll("svg")
                .data(this.filteredData)
                .enter()
                .append("svg")
                .attr("class", "bullet")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(chart)

            var title = svg.append("g")
                .style("text-anchor", "end")
                .attr("transform", "translate(-10," + height / 4 + ")");

            title.append("text")
                .attr("class", "title")
                .text(function(d) { return d.title; });

            title.append("text")
                .attr("class", "subtitle")
                .attr("dy", "1em")
                .text(function(d) { return d.subtitle; });
        }
    },
}
</script>

<style lang="scss">
@import "../../scss/variables.scss";

select.form-control{
    appearance: menulist-button !important;
}

.bullet {
    margin: 10px 0;
}

.bullet { font: 10px sans-serif; margin-left:auto;margin-right:auto;}
.bullet .marker { stroke: #4D4D4D; stroke-width: 2px;}

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

.bullet .measure.s0 { fill: $blue-dark; }

.bullet .title { font-size: 12px; font-weight: bold; }
.bullet .subtitle.s04 { fill: #000000; font-size: 16px; font-weight: bold;}
.bullet .subtitle.s13 { fill: #999999; font-size: 12px; font-weight: bold;}
.bullet .subtitle.s2  { fill: #999999; font-size: 10px;}
</style>