<template>
    <div>
        <widget-heading title="Indikatoren" icon="fa-balance-scale" info-content="Informationen über das Widget"></widget-heading>
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
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="Checkme1" />
                                <label class="form-check-label" for="Checkme1">Zeit</label>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="Checkme2" checked />
                                <label class="form-check-label" for="Checkme2">Assignments</label>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="Checkme3" />
                                <label class="form-check-label" for="Checkme3">Number of activities</label>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="dropdown mx-2">
                <button
                    class="btn btn-secondary dropdown-toggle"
                    id="filter" data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >Zeitraum</button>
                <ul class="dropdown-menu" aria-labelledby="filter">
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="1" />
                                <label class="form-check-label" for="1">Zeit</label>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="2" checked />
                                <label class="form-check-label" for="2">Assignments</label>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="" id="3" />
                                <label class="form-check-label" for="3">Number of activities</label>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="bullet-chart mt-3"></div>

    </div>
</template>

<script>
import * as d3 from "../../js/d3.min.js";
import "../../js/bullet.js";

import WidgetHeading from "../WidgetHeading.vue";
import Communication from "../../scripts/communication";


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
        // margin: {
        //     type: Object,
        //     default: () => ({ top: 10, right: 40, bottom: 20, left: 40 })
        // },
        // range: {
        //     type: Array,
        //     default: () => [0, 100]
        // },
        // ranges: {
        //     type: Array,
        //     default: () => [[0, 30], [30, 70], [70, 100]]
        // },
        // measure: {
        //     type: Number,
        //     default: 50
        // },
        // marker: {
        //     type: Number,
        //     default: 80
        // },
        // format: {
        //     type: Function,
        //     default: d => d
        // }
        // rangeColors: {
        //     type: Array,
        //     default: function() {
        //         return ['#ff7e5a', '#3f51b5', '#76BF8A'];
        //     }
        // }
    },

    data: function () {
        return {
            padding: 10,
            currentGoal: 'overview',
            data: [
                {
                    title: 'Time spent',
                    subtitle:"hours",
                    ranges: [1500, 2000, 2500],
                    measures: [2400],
                    markers: [2100],
                },
                {
                    title:"Assignments",
                    subtitle:"out of 5",
                    ranges: [3.5,4.25,5],
                    measures: [4.7],
                    markers: [4.4]
                },
                {
                    title:"Enagement",
                    subtitle:"out of 5",
                    ranges: [3.5,4.25,5],
                    measures: [3.2],
                    markers: [3.4]
                },
            ],
        }
    },

    mounted() {
        this.drawChart();
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
            if (response.success) {
                console.log(JSON.parse(response.data));
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
            this.currentGoal = event.target.value;
            this.$forceUpdate();
        },

        drawChart () {
            var margin = {top: 5, right: 40, bottom: 50, left: 120},
                width = 600 - margin.left - margin.right,
                height = 50;

            var chart = d3.bullet()
                .width(width)
                .height(height);

            var svg = d3.select(".bullet-chart").selectAll("svg")
                .data(this.data)
                .enter().append("svg")
                .attr("class", "bullet")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(chart);

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
select.form-control{
    appearance: menulist-button!important;
}

.bullet {
    margin: 10px 0;
}


.bullet { font: 10px sans-serif; margin-left:auto;margin-right:auto;}
.bullet .marker { stroke: #4D4D4D; stroke-width: 2px;}
.bullet .marker.s0 { fill-opacity:0; stroke: #999999; stroke-width: 2px; }
.bullet .marker.s1 { fill-opacity:0; stroke: #000; stroke-width: 2px; }
.bullet .tick line { stroke: #666; stroke-width: .5px; }

.bullet .range.s0 { fill: #C7E1A6; }
.bullet .range.s1 { fill: #DDE3D5; }
.bullet .range.s2 { fill: #F5E0E0; }

.bullet .measure.s0 { fill: #999999; }
//.bullet .measure.s1 { fill: #999999; }
//.bullet .measure.s2 { fill: #eeeeee; }

.bullet .title { font-size: 12px; font-weight: bold; }
.bullet .subtitle.s04 { fill: #000000; font-size: 16px; font-weight: bold;}
.bullet .subtitle.s13 { fill: #999999; font-size: 12px; font-weight: bold;}
.bullet .subtitle.s2  { fill: #999999; font-size: 10px;}
</style>