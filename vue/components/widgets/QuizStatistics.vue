<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading title="Ergebnisse" icon="fa-hourglass-o" info-content="info"></widget-heading>
        <div class="row">
            <div class="form-group col-6 mb-0 pr-1">
                <select
                    v-model="selectedType"
                    id="select-goal"
                    class="form-control form-select"
                >
                    <option value="all">Alle Aufgaben</option>
                    <option value="quiz">Quizzes</option>
                    <option value="assignment">Assignments</option>
                </select>
            </div>
            <div class="form-group col-6 mb-0 pl-1">
                <select
                    v-model="selectedSection"
                    id="select-goal"
                    class="form-control form-select"
                >
                    <option value="-1">Alle Kurseinheiten</option>
                    <option v-for="(section, index) in getSections" :key="index" :value="index">{{ section[0].sectionname }}</option>
                </select>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <div class="form-group form-check mt-2 ml-1">
                <input type="checkbox" class="form-check-input" id="compare-to-average" v-model="showAverage" />
                <label class="form-check-label" for="compare-to-average">Vergleich mit Kurs</label>
            </div>

            <div v-if="showAverage" class="legend">
                <span class="rect rect--user"></span><span class="mr-2">Du</span>
                <span class="rect rect--avg"></span><span>Kursdurchschnitt</span>
            </div>
        </div>

        <div class="bar-chart flex-shrink-1">
            <svg ref="chart" :viewBox="viewBox"></svg>
        </div>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import * as d3 from "../../js/d3.min.js";
import {ajax} from '../../store/store';
import { mapGetters, mapState  } from 'vuex';


export default {
    name: "QuizStatistics",

    components: {WidgetHeading},

    data () {
        return {
            selectedType: 'all',
            selectedSection: -1,
            quizzes: [],
            assignments: [],
            data: [],
            width: 500,
            height:  210,
            margin: {top: 10, right: 30, bottom: 25, left: 80},
            xLabel: 'Assignments',
            yLabel: 'Result',
            showAverage: false,
        }
    },

    watch: {
        selectedType: {
            handler: function() {
                this.filterData();
            },
            immediate: true,
        },

        selectedSection: {
            handler: function(newVal) {
                this.$store.commit('progress/setCurrentSection', newVal);
                this.filterData();
            },
            immediate: true,
        },

        currentSection: {
            handler: function(newVal) {
                this.selectedSection = Number(newVal);
                this.filterData();
            },
            immediate: true,
        },

        showAverage: {
            handler: function() {
                this.drawChart();
            },
        },
    },

    mounted() {
        Promise.all([this.getQuizzes(), this.getAssignments()]).then(() => {
            this.displayData(this.dataAll);
        });
    },

    computed: {
        viewBox() {
            return `0 0 ${this.width} ${this.height}`;
        },

        dataAll () {
            return [...this.quizzes, ...this.assignments]
        },

        ...mapState(['strings', 'currentSection', 'sectionNames']),
        ...mapGetters(['getCurrentSection', 'getSectionNames']),
    },

    methods: {
        filterData() {
            let filteredData = this.dataAll;

            if (this.selectedType !== "all") {
                filteredData = filteredData.filter(
                    (item) => item.type === this.selectedType
                );
            }

            if (this.selectedSection != -1) {
                filteredData = filteredData.filter(
                    (item) => Number(item.section) === this.selectedSection
                );
            }

            this.displayData(filteredData);
        },

        displayData(data) {
            this.data = data
            this.drawChart()
        },

        async getQuizzes () {
            const response = await ajax('format_ladtopics_getQuizzes', {
                course: this.$store.state.courseid,
                // userid: this.$store.state.userid,
                userid: 3
            });

            if (response.success) {
                this.quizzes = JSON.parse(response.data)
                this.quizzes = Object.values(this.quizzes).map(item => {
                    return { category: item.name, value: (item.user_grade / item.max_grade), user_grade: item.user_grade, max_grade: item.max_grade , type: 'quiz', section: item.section, avg_value: (item.avg_grade / item.max_grade), avg_grade: item.avg_grade, num_participants: item.num_participants, user_attempts: item.user_attempts };
                });
            }

            console.log("response quizzes: ", this.quizzes)
        },

        async getAssignments () {
            const response = await ajax('format_ladtopics_getAssignments', {
                course: 4,
                userid: 3
            });

            if (response.success) {
                this.assignments = JSON.parse(response.data)
                this.assignments = Object.values(this.assignments).map(item => {
                    return { category: item.name, value: (item.user_grade / item.max_grade), user_grade: item.user_grade, max_grade: item.max_grade, type: 'assignment', section: item.section, avg_value: (item.avg_grade / item.max_grade), avg_grade: item.avg_grade, num_participants: item.num_participants, user_attempts: item.user_attempts };
                });
            }

            console.log("response assignments: ",  this.assignments)
        },

        drawChart() {
            var x = d3.scaleLinear;

            const yRange = [this.height - this.margin.bottom, this.margin.top];
            const xFormat = "%";
            const xRange = [this.margin.left, this.width - this.margin.right];

            var xDomain = [0,d3.max(this.data, d => Math.max(d.value, d.avg_value))];
            var yDomain = d3.map(this.data, (d) => d.category);

            const yScale = d3.scaleBand(yDomain, yRange).padding(0.1);
            const yAxis = d3.axisLeft(yScale);

            const xScale = x(xDomain, xRange);
            const xAxis = d3.axisBottom(xScale).ticks(this.width / 80, xFormat);

            const svg = d3.select(this.$refs.chart);

            svg.selectAll("*").remove();

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${xRange[0]}, 0)`)
                .call(yAxis);

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${yRange[0]})`)
                .call(xAxis);

            if (this.showAverage) {
                // add bars for user grades
                svg.selectAll(".user-bar")
                    .data(this.data)
                    .enter()
                    .append("rect")
                    .attr("class", "user-bar")
                    .attr("x", xRange[0] + 1)
                    .attr("y", (d) => yScale(d.category))
                    .attr("width", (d) => xScale(d.value) - xRange[0])
                    .attr("height", yScale.bandwidth() / 2 - 1)
                    .attr("fill", "#64A0D6")
                    .each(function(d) {
                            svg.append("text")
                                .attr("class", "value-text")
                                .attr("x", xScale(d.value) - 50)
                                .attr("y", yScale(d.category) + yScale.bandwidth() / 3)
                                .text(`${Math.trunc(d.user_grade)} / ${Math.trunc(d.max_grade)}`)
                                .style("font-size", "12px");
                    });

                // add bars for average grades
                svg.selectAll(".avg-bar")
                    .data(this.data)
                    .enter()
                    .append("rect")
                    .attr("class", "avg-bar")
                    .attr("x", xRange[0] + 1)
                    .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2)
                    .attr("width", (d) => xScale(d.avg_value) - xRange[0])
                    .attr("height", yScale.bandwidth() / 2 - 1)
                    .attr("fill", "#CED4DA")
                    .each(function(d) {
                        svg.append("text")
                            .attr("class", "value-text")
                            .attr("x", xScale(d.avg_value) - 50)
                            .attr("y", yScale(d.category) + yScale.bandwidth() * 0.85)
                            .text(`${Math.trunc(d.avg_grade)} / ${Math.trunc(d.max_grade)}`)
                            .style("font-size", "12px");
                    });
            } else {
                svg.selectAll(".user-bar")
                    .data(this.data)
                    .enter()
                    .append("rect")
                    .attr("class", "user-bar")
                    .attr("x", xRange[0] + 1)
                    .attr("y", (d) => yScale(d.category) + (yScale.bandwidth() - yScale.bandwidth() / 1.5) / 2)
                    .attr("width", (d) => xScale(d.value) - xRange[0])
                    .attr("height", yScale.bandwidth() / 1.5)
                    .attr("fill", "#64A0D6")
                    .each(function(d) {
                        svg.append("text")
                            .attr("class", "value-text")
                            .attr("x", xScale(d.value) - 50)
                            .attr("y", yScale(d.category) + yScale.bandwidth() / 1.7)
                            .text(`${Math.trunc(d.user_grade)} / ${Math.trunc(d.max_grade)}`)
                            .style("font-size", "12px");
                    });
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.bar-chart {
    overflow-y: auto;
}

.rect {
    stroke-width: 3px;
    stroke: white;
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-right: 1px;

    &--user {
        background-color: #64A0D6;
    }

    &--avg {
        background-color: #CED4DA;
    }
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-thumb {
    background: #888;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>