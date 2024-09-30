<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading icon="fa-bar-chart" :info-content="info" title="Ergebnisse"></widget-heading>
        <div class="row">
            <div class="form-group col-6 mb-0 pr-1">
                <select
                    id="select-goal"
                    v-model="selectedType"
                    class="form-control form-select"
                >
                    <option value="all">Alle Ergebnisse</option>
                    <option value="quiz">Tests</option>
                    <option value="assignment">Aufgaben</option>
                </select>
            </div>
            <div class="form-group col-6 mb-0 pl-1">
                <select
                    id="select-goal"
                    v-model="selectedSection"
                    class="form-control form-select"
                >
                    <option value="-1">Alle Kurseinheiten</option>
                    <option v-for="(section, index) in getSections" :key="index" :value="index">
                        {{ section[0].sectionname }}
                    </option>
                </select>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <div class="form-group form-check mt-2 ml-1">
                <input id="compare-to-average" v-model="showAverage" class="form-check-input" type="checkbox"/>
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
import {mapGetters, mapState} from 'vuex';
import Communication from "../../scripts/communication";


export default {
    name: "QuizStatistics",

    components: {WidgetHeading},

    data() {
        return {
            selectedType: 'all',
            selectedSection: -1,
            quizzes: [],
            assignments: [],
            data: [],
            width: 500,
            height: 210,
            margin: {top: 10, right: 30, bottom: 25, left: 80},
            xLabel: 'Assignments',
            yLabel: 'Result',
            showAverage: false,
            info: 'Dieses Widget zeigt deine Quiz-Ergebnisse in einem Balkendiagramm an. Du kannst optional auch deine Ziele mit dem Klassendurchschnitt vergleichen. Dies ist hilfreich, um deine Leistung in Bezug auf die Klassendurchschnittswerte zu bewerten und herauszufinden, wie du im Vergleich zu anderen Lernenden abschneidest. Auf diese Weise kannst du deine Stärken und Schwächen identifizieren und gezielt an deinen Schwächen arbeiten, um deine Ziele zu erreichen. Um das Balkendiagramm zu lesen, beachte bitte die Achsenbeschriftungen. Die vertikale Achse zeigt die Quiz-Kategorien an, während die horizontale Achse die Anzahl der Punkte angibt.',
        }
    },

    watch: {
        selectedType: {
            handler: function () {
                this.filterData();
            },
            immediate: true,
        },

        selectedSection: {
            handler: function (newVal) {
                this.$store.commit('overview/setCurrentSection', newVal);
                this.filterData();
            },
            immediate: true,
        },

        currentSection: {
            handler: function (newVal) {
                this.selectedSection = Number(newVal);
                this.filterData();
            },
            immediate: true,
        },

        showAverage: {
            handler: function () {
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

        dataAll() {
            return [...this.quizzes, ...this.assignments]
        },

        ...mapState('overview', ['currentSection']),
        ...mapGetters('overview', ['getCurrentSection', 'getSections']),
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

        async getQuizzes() {
            const response = await Communication.webservice(
                'get_quizzes',
                {
                    course: this.$store.state.courseid,
                }
            );

            if (response.success) {
                this.quizzes = JSON.parse(response.data)

                this.quizzes = Object.values(this.quizzes).map(item => ({
                    ...item,
                    category: item.name,
                    value: (item.user_grade / item.max_grade),
                    avg_value: (item.avg_grade / item.max_grade),
                    type: 'quiz'
                }));
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        async getAssignments() {
            const response = await Communication.webservice(
                'get_assignments',
                {
                    course: this.$store.state.courseid,
                }
            );

            if (response.success) {
                this.assignments = JSON.parse(response.data)
                this.assignments = Object.values(this.assignments).map(item => ({
                    ...item,
                    category: item.name,
                    value: (item.user_grade / item.max_grade),
                    avg_value: (item.avg_grade / item.max_grade),
                    type: 'assignment'
                }));
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        drawChart() {
            var x = d3.scaleLinear;

            const yRange = [this.height - this.margin.bottom, this.margin.top];
            const xFormat = "%";
            const xRange = [this.margin.left, this.width - this.margin.right];

            var xDomain = [0, d3.max(this.data, d => Math.max(d.value, d.avg_value))];
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
                    .each(function (d) {
                        svg.append("text")
                            .attr("class", "value-text")
                            .attr("x", xScale(d.value) - 50)
                            .attr("y", yScale(d.category) + yScale.bandwidth() / 3)
                            .text(`${Math.trunc(d.user_grade)} / ${Math.trunc(d.max_grade)}`)
                            .style("font-size", "12px");
                    })

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
                    .each(function (d) {
                        svg.append("text")
                            .attr("class", "value-text")
                            .attr("x", xScale(d.avg_value) - 50)
                            .attr("y", yScale(d.category) + yScale.bandwidth() * 0.85)
                            .text(`${Math.trunc(d.avg_grade)} / ${Math.trunc(d.max_grade)}`)
                            .style("font-size", "12px");
                    })
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
                    .each(function (d) {
                        svg.append("text")
                            .attr("class", "value-text")
                            .attr("x", xScale(d.value) - 50)
                            .attr("y", yScale(d.category) + yScale.bandwidth() / 1.7)
                            .text(`${Math.trunc(d.user_grade)} / ${Math.trunc(d.max_grade)}`)
                            .style("font-size", "12px");
                    })
            }
        },
    }
}
</script>

<style lang="scss">
@import "../../scss/variables.scss";

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
        background-color: #4087BE;
    }

    &--avg {
        background-color: $light-grey;
    }
}

.user-bar {
    fill: #4087BE;
}

.avg-bar {
    fill: $light-grey;
}
</style>