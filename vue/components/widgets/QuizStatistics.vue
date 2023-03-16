<template>
    <div class="overflow-hidden bla">
        <widget-heading title="Quiz Statistics" icon="fa-hourglass-o" info-content="info"></widget-heading>
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
                    <option v-for="section in sectionNames" :key="section.id" :value="section.id">{{ section.name }}</option>
                </select>
            </div>
        </div>

        <svg ref="chart" class="bar-chart"></svg>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import * as d3 from "../../js/d3.min.js";
import {ajax} from '../../store';
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
            height:  240,
            margin: {top: 10, right: 10, bottom: 40, left: 40},
            xLabel: 'Assignments',
            yLabel: 'Result',
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
                this.$store.commit('setCurrentSection', newVal);
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
            this.data = data.map(d => ({ category: d.category, value: d.value }));
            this.drawChart()
        },

        async getQuizzes () {
            const response = await ajax('format_ladtopics_getQuizzes', {
                course: 4,
                userid: 3
            });

            if (response.success) {
                this.quizzes = JSON.parse(response.data)
                this.quizzes = Object.values(this.quizzes).map(item => {
                    return { category: item.name, value: (item.user_grade / item.max_grade), user_grade: item.user_grade, max_grade: item.max_grade , type: 'quiz', section: item.section };
                });
            }

            console.log("response quizzes: ",  JSON.parse(response.data))
        },

        async getAssignments () {
            const response = await ajax('format_ladtopics_getAssignments', {
                course: 4,
                userid: 3
            });

            if (response.success) {
                this.assignments = JSON.parse(response.data)
                this.assignments = Object.values(this.assignments).map(item => {
                    return { category: item.name, value: (item.user_grade / item.max_grade), user_grade: item.user_grade, max_grade: item.max_grade, type: 'assignment', section: item.section };
                });
            }

            console.log("response assignments: ",  this.assignments)
        },

        drawChart() {
            var xDomain, yDomain;
            var yType = d3.scaleLinear;
            const yRange = [this.height - this.margin.bottom, this.margin.top]; // [bottom, top]
            const yFormat = "%";
            const xRange = [this.margin.left, this.width - this.margin.right];

            const X = d3.map(this.data, (d) => d.category);
            const Y = d3.map(this.data, (d) => d.value);

            if (xDomain === undefined) xDomain = X;
            if (yDomain === undefined) yDomain = [0, 1];
            xDomain = new d3.InternSet(xDomain);

            const I = d3.range(X.length).filter((i) => xDomain.has(X[i]));

            const xScale = d3.scaleBand(xDomain, xRange).padding(0.1);
            const yScale = yType(yDomain, yRange);
            const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
            const yAxis = d3.axisLeft(yScale).ticks(this.height / 40, yFormat);

            const svg = d3.select(this.$refs.chart);
            
            svg.selectAll("*").remove();

            svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
            svg.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${yRange[0]})`).call(xAxis);
            svg.append("g").attr("class", "y-axis").attr("transform", `translate(${xRange[0]}, 0)`).call(yAxis);
            svg.selectAll(".bar")
                .data(this.data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", (d) => xScale(d.category))
                .attr("y", (d) => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", (d) => yRange[0] - yScale(d.value))
                .attr("fill", "#5A97C7");
        },
    }
}
</script>

<style lang="scss" scoped>
.bar-chart {
    margin: 16px;
}
</style>