/* eslint-disable capitalized-comments */
/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */
/* eslint-disable valid-jsdoc */
/**
 * ActivityChart
 *
 * @module     format/serial3
 * @package    format_serial3
 * @class      ActivityChart
 * @copyright  2020 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define(['jquery'
], function ($) {
    var chart = '';
    var color_range = ['#004C97', '#004C97', '#004C97', '#004C97', '#004C97', '#004C97', '#004C97'];
    var activityTypes = { 'viewed': 'betrachtet', 'updates': 'bearbeitet', 'deleleted': 'gelöscht', 'created': 'erstellt' };
    var label = {
        'mod_forum': 'Forum',
        'mod_glossary': 'Glossar',
        'mod_wiki': 'Wiki',
        'mod_assignment': 'Aufgabe',
        'mod_studentquiz': 'StudentQuiz',
        'mod_quiz': 'Quiz'
    };
    var actionTypes = Object.keys(label);
    var width = document.getElementById('serial3-container-0').offsetWidth;
    var margins = { top: 15, right: 0, bottom: 20, left: 10 };

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    var activityChart = function (d3, dc, crossfilter, moment, data, utils, courseSettings) {
        let _this = this;
        this.timeFilterRange = [0, 0]

        data = data.filter(function (d) {
            return d.utc >= courseSettings.start && d.utc < courseSettings.end ? true : false;
        });

        // charts
        chart = dc.bubbleChart("#timeline-chart");

        this.chart = function () {
            return chart;
        };

        data.forEach(function (d, i) {
            d.date = new Date(d.utc * 1000);
            d.action_type = actionTypes.indexOf(d.action_type);
        });

        var facts = crossfilter(data);

        var mainDimension = facts.dimension(function (d) {
            return [d.date, d.action_type, d.action];
        });
        var mainGroup = mainDimension.group().reduce(
            /* callback for when data is added to the current filter results */
            function (p, v) {
                ++p.count;
                p.date = v.date;
                p.action = v.action;
                p.action_type = v.action_type;
                return p;
            },
            /* callback for when data is removed from the current filter results */
            function (p, v) {
                --p.count;
                p.date = v.date;
                p.action = v.action;
                p.action_type = v.action_type;
                return p;
            },
            // init filter 
            function () {
                return { count: 0, date: 0, action: '', action_type: '' };
            });

        this.getGroup = function () {
            return mainGroup;
        };

        var xRange = [
            d3.min(mainGroup.all(), function (d) { return d.key[0]; }),
            d3.max(mainGroup.all(), function (d) { return d.key[0]; })
        ];
        xRange[1] = moment(xRange[1]).isSameOrBefore(new Date()) ? new Date() : xRange[1];
        this.timeFilterRange = xRange;
        this.getXRange = function () {
            return xRange;
        };

        var maxRadius = d3.max(mainGroup.all(), function (d) {
            return d.value.count;
        });

        var colorBand = d3.scaleOrdinal().domain(actionTypes).range(color_range);
        var tmp = [];
        for (var i = 0; i < data.length; i++) {
            tmp.push(data[i].action_type);
        }
        var countActionTypes = tmp.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        }).length;

        countActionTypes = 6;//countActionTypes < 2 ? 5 : countActionTypes;
        chart
            .width(width)
            .height(20 * countActionTypes)
            .margins({ top: 10, bottom: 20, left: margins.left, right: margins.right })
            .clipPadding(65)
            .renderLabel(false)
            .minRadius(1)
            .maxBubbleRelativeSize(0.3)
            .x(d3.scaleTime().domain(xRange).range([0, width]))
            //.y(d3.scale.ordinal().range([0,3]))
            .brushOn(true)
            .dimension(mainDimension)
            .group(mainGroup)
            .renderHorizontalGridLines(true)
            .keyAccessor(function (p) {
                return p.value.date;
            })
            .valueAccessor(function (p) {
                return p.value.action_type;
            })
            .radiusValueAccessor(function (p) {
                return p.value.count / maxRadius;
            })
            //.colorAccessor(function (kv) { return kv.value.action_type; })
            .colors(colorBand)
            .title(function (p) {
                return [
                    "Am " + utils.formatDate(p.value.date),
                    " haben Sie " + utils.numberToWord(p.value.count, 'mal'),
                    " das " + label[actionTypes[p.value.action_type]],
                    " " + activityTypes[p.value.action]
                ].join("");
            })
            .xAxis(d3.axisBottom()
                .ticks(10)
                .tickFormat(function (v) {
                    let start = new Date(_this.timeFilterRange[0]).getTime();
                    let end = new Date(_this.timeFilterRange[1]).getTime();
                    if ((end - start) > 0 && (end - start) < 518400000) { // six days = 518400000 = 6 * 24 * 3600 * 1000
                        let h = utils.formatHour(v);
                        return h === '00:00' ? utils.formatDate(v) : h;
                    }
                    return utils.formatDate(v);
                })
            );


        this.update = function (range) {
            this.timeFilterRange = range;
            chart
                .x(d3.scaleTime().domain(range))
                .selectAll('line.grid-line')
                .attr('y2', chart.effectiveHeight())
                .attr('opacity', 0.7)
                ;
            //chart.selectAll('line.grid-line').attr('y2', chart.effectiveHeight());
            chart.render();
        };

        // correct axis positioning
        chart.selectAll('.axis.y .tick')
            .attr('transform', "translate(50,0)")
            .style('transition-duration', '0');

        // add y-axis labels
        chart
            .elasticY(true)
            .yAxisPadding(0) // for values greater 0 the second tick label disappears
            .yAxis()
            .ticks(countActionTypes)
            .tickFormat(function (d) {
                if (d === Math.ceil(d)) {
                    return label[actionTypes[d]];
                }
            });
        chart.render();

        // redraw lines
        chart.on('pretransition', function () {
            chart.selectAll('line.grid-line')
                .attr('y2', chart.effectiveHeight())
                .attr('opacity', 0.5);
        });

        chart.on('renderlet', function (chart) {
            var y = d3.select('#timeline-chart svg');
            y.select('g.y')
                .style('transition-duration', '0')
                .attr('transform', 'translate(35,10)');

            y.selectAll('g.y g.tick text')
                .attr('text-anchor', 'start')
                .attr('class', 'timeline-y-label');

        });
    };

    /**
     * Resize chart if window sizes change
     */
    window.onresize = function (event) {
        // not working
        //console.log(activityChart.chart.width());
        width = document.getElementById('planing-component').offsetWidth;
        if (activityChart && activityChart.chart) {
            activityChart.chart.width(width).transitionDuration(0);
            activityChart.chart.group(activityChart.getGroup());
        }

        //dc.redrawAll(activityChart.getGroup());
    };

    return activityChart;

});