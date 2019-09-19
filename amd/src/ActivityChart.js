/* eslint-disable capitalized-comments */
/* eslint-disable space-before-function-paren */
/* eslint-disable valid-jsdoc */
/**
 * ActivityChart
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      ActivityChart
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define([
], function () {
    var chart = '';
    var color_range = ['#004C97', '#004C97', '#004C97', '#004C97', '#004C97', '#004C97', '#004C97'];//['yellow', 'blue', 'purple', 'red', 'orange', 'green', 'black'];
    //['mod_glossary', 'mod_forum', 'mod_wiki'];
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
    var width = document.getElementById('planing-component').offsetWidth;
    var margins = { top: 15, right: 10, bottom: 20, left: 10 };

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    var activityChart = function (d3, dc, crossfilter, moment, data, utils) {
        // charts
        chart = dc.bubbleChart("#timeline-chart");

        this.chart = function(){ return chart; };

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
            .xAxis(d3.axisBottom().ticks(10))
            ;

        this.update = function(range) { 
            chart.x(d3.scaleTime().domain(range));
        };

        chart.render();
        //dc.renderAll();

        // correct axis positioning
        chart.selectAll('.axis.y .tick')
            .attr('transform', "translate(50,0)")
            .style('transition-duration', '0');

        chart.on('pretransition', function () {
            chart.selectAll('line.grid-line').attr('y2', chart.effectiveHeight());
        });

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
     * Resize charte if window sizes change
     */
    window.onresize = function (event) {
        width = document.getElementById('planing-component').offsetWidth;
        chart.width(width).transitionDuration(0);
        chart.group(activityChart.getGroup());

        //dc.redrawAll(activityChart.getGroup());
    };

    return activityChart;

});