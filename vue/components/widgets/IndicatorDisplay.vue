<template>
    <div class="position-relative h-100 d-flex flex-column indicator-display">
        <widget-heading icon="fa-balance-scale" :info-content="info" title="Lernziele"></widget-heading>
        <div class="indicator-container px-1">
            <div>
                <div class="form-group d-flex align-items-center pr-3">
                    <label class="pr-2 m-0 flex-shrink-0" for="select-goal">Mein Ziel für diesen Kurs ist: </label>
                    <select id="select-goal" class="form-control form-select" @change="switchGoal($event)">
                        <option :selected="learnerGoal === 'master'" value="master">den Kurs zu meistern</option>
                        <option :selected="learnerGoal === 'passing'" value="passing">den Kurs zu bestehen</option>
                        <option :selected="learnerGoal === 'overview'" value="overview">einen Überblick zu bekommen</option>
                        <option :selected="learnerGoal === 'practice'" value="practice">praktisches/job-relevantes Wissen
                            anzueignen
                        </option>
                    </select>
                    <div class="dropdown">
                        <div id="dropdownMenuButton" aria-expanded="false" aria-haspopup="true"
                            class="btn btn-link dropdown-toggle ml-3 icon" data-toggle="dropdown" type="button"><i
                                class="fa fa-cog"></i></div>
                        <ul aria-labelledby="dropdownMenuButton" class="dropdown-menu" @change="selectIndicators">
                            <li v-for="(indicator, index ) in indicators" :key="index">
                                <div class="form-check ml-2">
                                    <input :id="index" class="form-check-input" type="checkbox" :value="indicator.id"
                                        :checked="indicator.checked" v-model="indicator.checked" />
                                    <label :for="index" class="form-check-label">{{
                                        indicator.title
                                    }}</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div ref="chartContainer">
                <div ref="bulletChart" class="bullet-chart mt-3"></div>
            </div>
            <div class="legend d-flex justify-content-start mt-3">
                <div class="d-flex flex-wrap align-items-center mr-3"><span
                        class="completion-rect rect-sm rect--you mr-1"></span><span class="">Dein Status</span>
                </div>
                <div class="d-flex align-items-center mr-3"><span
                        class="completion-rect rect-sm rect--weak mr-1"></span><span class="">Verfehlt das Ziel</span></div>
                <div class="d-flex align-items-center mr-3"><span class="completion-rect rect-sm rect--ok mr-1"></span><span
                        class="">Nah am Ziel</span></div>
                <div class="d-flex align-items-center"><span class="completion-rect rect-sm rect--strong mr-1"></span><span
                        class="">Erreicht das Ziel</span></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from "../../js/d3.min.js";
import "../../js/bullet.js";
import WidgetHeading from "../WidgetHeading.vue";
import { mapActions, mapGetters, mapState } from "vuex";


export default {
    name: "IndicatorDisplay",

    components: { WidgetHeading },

    data: function () {
        return {
            containerWidth: 0,
            indicators: [
                { value: 'proficiency', title: 'Kompetenz', id: 'proficiency', checked: true },
                { value: 'progressUnderstanding', title: 'Selbsteinschätzung', id: 'progressUnderstanding', checked: true },
                { value: 'userGrades', title: 'Ergebnisse', id: 'userGrades', checked: false },
                { value: 'timeliness', title: 'Time Management', id: 'timeliness', checked: false },
                //{ value: 'socialActivity', title: 'Soziale Interaktion', id: 'socialActivity', checked: false },
            ],
            data: [
                {
                    id: 'progressUnderstanding', // meint das Verständis in Bezug auf alle Aktiviäten
                    title: 'Verständnis insg.',
                    subtitle: 'Selbsteinschätzung in %',
                    ranges: [],
                    measures: [],
                    markers: [],
                },
                {
                    id: 'proficiency', // meint das Verständnis der bereits bearbeiteten Aufgaben
                    title: 'Verständnis indiv.',
                    subtitle: 'Bearbeitete Aktivitäten. in %',
                    ranges: [],
                    measures: [],
                    markers: [],
                },
                {
                    id: 'userGrades',
                    title: 'Ergebnisse',
                    subtitle: 'Gesamtpunktzahl',
                    ranges: [],
                    measures: [],
                    markers: [],
                },
                {
                    id: 'timeliness',
                    title: 'Time Management',
                    subtitle: 'in %',
                    ranges: [],
                    measures: [],
                    markers: [],
                },
                /*{
                    id: 'socialActivity',
                    title: 'Soziale Interaktion',
                    subtitle: 'Anzahl Forenbeiträge',
                    ranges: [],
                    measures: [],
                    markers: [],
                },*/
            ],
            ranges: {},
            info: "Das Lernziel-Widget möchte Sie dazu anregen, Ihre Fortschritte für Ihr persönliches Lernziel im Blick zu behalten. Die Lernziele fassen wir in vier Kategorien zusammen:<br>(1) den Kurs meistern,<br>(2) den Kurs bestehen,<br>(3) einen Überblick über die Kursinhalten zu erlangen, oder<br>(4) praktisches bzw. berufsrelevantes Wissen zu erlangen.<br>Wählen Sie zu Beginn des Semesters ein Ziel aus und ändern Sie bei Bedarf im Laufe des Semesters.<br><br>In den Balkendiagrammen ist Ihr aktueller Stand (dunkelblau) dargestellt. Anhand der farblichen Bereiche erkennen Sie, wie weit Sie bei der Erreichung Ihres Ziels bislang gekommen sind:<ul><li>Noch nicht erreichtes Ziel (hellblau): Sie haben Ihr Ziel noch nicht erricht.</li><li>Nah am Ziel (blau): Sie haben Ihr gestecktes Lernziel bald erreicht.</li><li>Erreichtes Ziel (dunkelblau): Sie waren fleißig und haben Ihr Lernziel erreicht, so dass Sie sich für den Kurs ggf. ein höheres Ziel stecken können.</li></ul>",
        }
    },

    mounted() {
        window.addEventListener("resize", this.resizeHandler);
        this.ranges = this.thresholds
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
                this.resizeHandler();
            },
        },
        timeliness: {
            deep: true,
            handler() {
                this.calculateTimeManagement();
            },
        },
        socialActivity: {
            deep: true,
            handler() {
                //this.data.find((d) => d.id === 'socialActivity').measures = [this.socialActivity]
                //this.drawChart(this.containerWidth);
            },
        },
        userGrade: {
            deep: true,
            handler() {
                this.calculateGrades();
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
            },
        },
        proficiency: {
            deep: true,
            handler() {
                this.calculateTopicProficiency();
            },
        },

        thresholds: {
            deep: true,
            handler() {
                this.ranges = this.thresholds;
                this.resizeHandler();
            },
        },
    },

    computed: {
        filteredData() {
            const filteredData = this.data.filter(indicator =>
                this.indicators.some(i => i.id === indicator.id && i.checked)
            );
            console.log('filtered', filteredData);
            return filteredData
        },

        ...mapState({
            timeliness: state => state.learnermodel.timeManagement,
            //socialActivity: state => state.learnermodel.socialActivity,
            userGrade: state => state.learnermodel.userGrade,
            totalGrade: state => state.learnermodel.totalGrade,
            progressUnderstanding: state => state.learnermodel.progressUnderstanding,
            proficiency: state => state.learnermodel.proficiency,
            learnerGoal: state => state.learnerGoal,
            thresholds: state => state.learnermodel.thresholds,
            strings: 'strings'
        }),
    },

    methods: {
        ...mapGetters(['getLearnerGoal']),
        ...mapActions(['updateLearnerGoal', 'fetchLearnerGoal']),

        resizeHandler() {
            if (this.$refs.chartContainer) {
                this.containerWidth = this.$refs.chartContainer.clientWidth
                this.$nextTick(() => {
                    this.drawChart(this.containerWidth)
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
            let proficiencyData = this.data.find((d) => d.id === 'proficiency');
            let progressData = this.data.find((d) => d.id === 'progressUnderstanding');
            let userGradesData = this.data.find((d) => d.id === 'userGrades');
            let timeData = this.data.find((d) => d.id === 'timeliness');
            //let socialData = this.data.find((d) => d.id === 'socialActivity');

            proficiencyData.ranges = this.ranges[selectedGoal].proficiency;
            progressData.ranges = this.ranges[selectedGoal].progress;
            userGradesData.ranges = this.ranges[selectedGoal].grades;
            timeData.ranges = this.ranges[selectedGoal].timeManagement;
            //socialData.ranges = this.ranges[selectedGoal].socialActivity;
        },

        calculateUnderstanding() {
            this.data.find((d) => d.id === 'progressUnderstanding').measures = [this.progressUnderstanding]
        },

        calculateTopicProficiency() {
            this.data.find((d) => d.id === 'proficiency').measures = [this.proficiency]
        },

        calculateGrades() {
            this.data.find((d) => d.id === 'userGrades').measures = [this.userGrade]
            this.ranges['master'].grades = [this.totalGrade * 0.5, this.totalGrade * 0.75, this.totalGrade]
            this.ranges['passing'].grades = [this.totalGrade * 0.3, this.totalGrade * 0.66, this.totalGrade]
            this.ranges['overview'].grades = [this.totalGrade * 0.5, this.totalGrade * 0.75, this.totalGrade]
            this.ranges['practice'].grades = [this.totalGrade * 0.2, this.totalGrade * 0.5, this.totalGrade]
            this.updateRanges(this.learnerGoal);
        },

        calculateTimeManagement() {
            this.data.find((d) => d.id === 'timeliness').measures = [this.timeliness]
        },

        drawChart(width) {
            var margin = { top: 5, right: 7, bottom: 50, left: 140 },
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

            // @FIXME: https://gist.github.com/mbostock/7555321
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

.indicator-display.icon {
    color: rgba(0, 0, 0, .6);
    width: 30px;
    height: 26px;
    font-size: 18px;
    border: 1px solid #8f959e;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 6px;
    padding-right: 6px;
}

.indicator-display.icon:hover {
    text-decoration: none;
}

.rect-sm {
    width: 12px;
    height: 12px;
}

.rect--you {
    background-color: $blue-dark;
    opacity: 1 !important;
}

.rect--ok {
    background-color: $blue-middle;
}

.rect--strong {
    background-color: $blue-dark;
}

.rect--weak {
    background-color: $blue-weak;
}

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
    margin: 0;
}

.bullet {
    font: 10px sans-serif;
    margin-left: auto;
    margin-right: auto;
}

.bullet .range.s0 {
    fill: $blue-dark;
    opacity: 0.8;
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
</style>