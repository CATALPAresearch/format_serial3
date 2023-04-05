<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading icon="fa-balance-scale" :info-content="info"
                        title="Lernziele"></widget-heading>
        <div class="indicator-container px-1">
            <div class="form-group d-flex align-items-center pr-3">
                <label class="pr-2 m-0 flex-shrink-0" for="select-goal">Mein Ziel für diesen Kurs ist: </label>
                <select
                    id="select-goal"
                    class="form-control form-select"
                    @change="switchGoal($event)"
                >
                    <option :selected="learnerGoal==='master'" value="master">den Kurs zu meistern</option>
                    <option :selected="learnerGoal==='passing'" value="passing">den Kurs zu bestehen</option>
                    <option :selected="learnerGoal==='overview'" value="overview">einen Überblick zu bekommen</option>
                    <option :selected="learnerGoal==='practice'" value="practice">praktisches/job-relevantes Wissen
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
            <div ref="container">
                <div ref="bulletChart" class="bullet-chart mt-3"></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from "../../js/d3.min.js";
import "../../js/bullet.js";
import thresholdData  from '../../data/thresholds.json';

import WidgetHeading from "../WidgetHeading.vue";
import {mapActions, mapGetters, mapState} from "vuex";


export default {
    name: "IndicatorDisplay",

    components: {WidgetHeading},

    data: function () {
        return {
            containerWidth: 0,
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
            ranges: {},
            info: 'Das Zielsetzungs-Widget bietet dir eine Möglichkeit, ein Lernziel zu definieren und deine Fortschritte dabei zu verfolgen. Unterhalb deines Ziels werden verschiedene Metriken in Form von Bullet Charts angezeigt, damit du sehen kannst, ob du auf Kurs bist, um dein Ziel zu erreichen. Bullet Charts sind einfach zu lesen, da sie eine Farbskala entlang des Diagramms haben, die dir anzeigt, ob die Metrik schwach, ok oder stark ist. Wenn du das Zielsetzungs-Widget nutzt, kannst du dich besser auf deine Lernziele konzentrieren und deinen Fortschritt überwachen, um sicherzustellen, dass du deine Ziele erreichen kannst.'
        }
    },

    mounted() {
        window.addEventListener("resize", this.resizeHandler);
        this.containerWidth = this.$refs.container.clientWidth;
        this.ranges = thresholdData

        this.getselectedIndicators();
        this.calculateUnderstanding();
        this.calculateTopicProficiency();
        this.calculateTimeManagement();
        this.calculateGrades();
    },

    beforeUnmount() {
        window.removeEventListener("resize", this.resizeHandler); // Remove event listener when component is destroyed
    },

    watch: {
        filteredData: {
            deep: true,
            handler() {
                this.drawChart(this.containerWidth);
            },
        },
        timeliness: {
            deep: true,
            handler() {
                this.drawChart(this.containerWidth);
            },
        },
        socialActivity: {
            deep: true,
            handler() {
                this.data.find((d) => d.title === 'Soziale Interaktion').measures = [this.socialActivity]
                this.drawChart(this.containerWidth);
            },
        },
        userGrade: {
            deep: true,
            handler() {
                this.calculateGrades();
                this.drawChart(this.containerWidth);
            },
        },
        totalGrade: {
            deep: true,
            handler() {
                this.drawChart(this.containerWidth);
            },
        },
        progressUnderstanding: {
            deep: true,
            handler() {
                this.calculateUnderstanding();
                this.drawChart(this.containerWidth);
            },
        },
        mastery: {
            deep: true,
            handler() {
                this.calculateTopicProficiency();
                this.drawChart(this.containerWidth);
            },
        },
    },

    computed: {
        filteredData() {
            const filteredData = this.data.filter(indicator =>
                this.indicators.some(i => i.title === indicator.title && i.checked)
            );
            return filteredData
        },

        ...mapState({
            timeliness: state => state.learnermodel.timeManagement,
            socialActivity: state => state.learnermodel.socialActivity,
            userGrade: state => state.learnermodel.userGrade,
            totalGrade: state => state.learnermodel.totalGrade,
            progressUnderstanding: state => state.learnermodel.progressUnderstanding,
            mastery: state => state.learnermodel.mastery,
            learnerGoal: state => state.learnerGoal,
            strings: 'strings'
        }),
    },

    methods: {
        ...mapGetters(['getLearnerGoal']),
        ...mapActions(['updateLearnerGoal', 'fetchLearnerGoal']),

        resizeHandler() {
            if (this.$refs.container) {
                this.containerWidth = this.$refs.container.clientWidth;
                this.$nextTick(() => {
                    this.drawChart(this.containerWidth);
                });
            }
        },

        getselectedIndicators() {
            let indicators = window.localStorage.getItem("learnerIndicators");
            if (indicators) {
                this.indicators = JSON.parse(indicators);
            }
        },

        switchGoal: async function (event) {
            await this.updateLearnerGoal(event.target.value);
            this.updateRanges(event.target.value);
            this.$forceUpdate();
        },

        selectIndicators() {
            if (localStorage) {
                window.localStorage.setItem("learnerIndicators", JSON.stringify(this.indicators));
            }
        },

        updateRanges(selectedGoal) {
            // Find the data object for the proficiency indicator
            let proficiencyData = this.data.find((d) => d.title === 'Kompetenz');
            let progressData = this.data.find((d) => d.title === 'Wissensstand');
            let gradesData = this.data.find((d) => d.title === 'Ergebnisse');
            let timeData = this.data.find((d) => d.title === 'Time Management');
            let socialData = this.data.find((d) => d.title === 'Soziale Interaktion');

            proficiencyData.ranges = this.ranges[selectedGoal].proficiency;
            progressData.ranges = this.ranges[selectedGoal].progress;
            gradesData.ranges = this.ranges[selectedGoal].grades;
            timeData.ranges = this.ranges[selectedGoal].timeManagement;
            socialData.ranges = this.ranges[selectedGoal].socialActivity;
        },

        calculateUnderstanding() {
            this.data.find((d) => d.title === 'Wissensstand').measures = [this.progressUnderstanding]
        },

        calculateTopicProficiency() {
            this.data.find((d) => d.title === 'Kompetenz').measures = [this.mastery]
        },

        calculateGrades() {
            this.data.find((d) => d.title === 'Ergebnisse').measures = [this.userGrade]
            this.ranges['master'].grades = [this.totalGrade * 0.5, this.totalGrade * 0.75, this.totalGrade]
            this.ranges['passing'].grades = [this.totalGrade * 0.3, this.totalGrade * 0.66, this.totalGrade]
            this.ranges['overview'].grades = [this.totalGrade * 0.5, this.totalGrade * 0.75, this.totalGrade]
            this.ranges['practice'].grades = [this.totalGrade * 0.2, this.totalGrade * 0.5, this.totalGrade]
            this.updateRanges(this.learnerGoal);
        },

        calculateTimeManagement() {
            this.data.find((d) => d.title === 'Time Management').measures = [this.timeliness]
        },

        drawChart(width) {
            var margin = {top: 5, right: 30, bottom: 50, left: 120},
                height = 50;

            width = width - margin.left - margin.right,

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
@import "../../scss/scrollbar.scss";

.indicator-container {
    overflow-y: auto;
    overflow-x: hidden;
}

select.form-control {
    appearance: menulist-button !important;
}

.bullet-chart {
    width: 100%;
    height: auto;
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