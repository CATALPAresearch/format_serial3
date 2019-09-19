/* eslint-disable capitalized-comments */
/* eslint-disable space-before-function-paren */
/* eslint-disable valid-jsdoc */
/**
 * FilterChart
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      Timeline
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define([
], function () {
    var timeFilterChart = '';


    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    var filterChart = function (d3, dc, crossfilter, facts, xRange, milestoneApp, utils) {

        timeFilterChart = dc.compositeChart("#filter-chart");
        this.xRange = xRange;
        this.milestoneApp = milestoneApp;
        var width = document.getElementById('planing-component').offsetWidth;
        var margins = { top: 15, right: 10, bottom: 20, left: 10 };
        var color_ms_status_range = ["#ffa500", "ff420e", "#80bd9e", "#89da59", "#004C97"];


        // FILTER CHART
        var semesterLimit = crossfilter([{ date: new Date(2019, 9, 1), y: 1 }, { date: new Date(2020, 2, 31), y: 1 }]);
        var timeFilterLimitDim = semesterLimit.dimension(function (d) { return d.date; });
        var timeFilterLimitGroup = timeFilterLimitDim.group().reduceCount(function (d) { return [0, d.date, 1]; });

        var timeFilterDim = facts.dimension(function (d) { return d.date; });
        var timeFilterGroup = timeFilterDim.group().reduceCount(function (d) { return d.date; });

        var milestoneData = milestoneApp.getMilestones();
        for (var i = 0; i < milestoneData.length; i++) { milestoneData[i].y = i % 3 + 1; }
        var msData = crossfilter(milestoneData);
        var msFilterDim = msData.dimension(function (d) { return [d.status, d.end, d.y]; });
        var msFilterGroup = msFilterDim.group().reduceCount(function (d) { return d.end; });

        timeFilterChart
            .width(width)
            .height(80)
            .margins({ top: 10, bottom: 10, left: margins.left - 10, right: margins.right })
            .compose([
                dc.barChart(timeFilterChart)
                    .dimension(timeFilterLimitDim)
                    .group(timeFilterLimitGroup),
                dc.barChart(timeFilterChart)
                    .dimension(timeFilterDim)
                    .group(timeFilterGroup)
                    .barPadding(0)
                    .gap(0)
                    .alwaysUseRounding(true),
                dc.bubbleChart(timeFilterChart)
                    .dimension(msFilterDim)
                    .group(msFilterGroup)
                    .keyAccessor(function (p) {
                        return p.key[1];
                    })
                    .valueAccessor(function (p) {
                        return p.key[2];
                    })
                    .radiusValueAccessor(function (p) {
                        return 0.4;
                    })
                    .colors(
                        d3.scaleOrdinal()
                            .domain(["urgent", "missed", "progress", "ready", "refelcted"])
                            // ["#ffa500","ff420e","#80bd9e", "#89da59", "#004C97"]
                            .range(color_ms_status_range))
                    .colorAccessor(function (d) { return d.key[0]; })
                    .renderLabel(false)
                    .renderTitle(false)
            ])
            .x(d3.scaleTime().domain(xRange).range([0, width]))
            .elasticX(true)
            .elasticY(true)
            .xAxisLabel('', 3)
            ;

        timeFilterChart.xAxis(d3.axisTop().ticks(10));
        timeFilterChart.xAxis().tickFormat(utils.multiFormat);
        timeFilterChart
            .yAxisLabel('', 10)
            .yAxis()
            .ticks(2)
            ;
        timeFilterChart.x(d3.scaleTime().domain(xRange).range([0, width]));


        var _this = this;
        timeFilterChart.on('filtered', function () {
            _this.filterTime(_this);
        });// other events: preRender, preRedraw

        timeFilterChart.render();

        // cheating
        var t = d3.select('#filter-chart svg');
        t.insert('g', ':first-child')
            .attr('transform', 'translate(' + 0 + ', ' + 10 + ')')
            .append('rect', ':first-child')
            .attr('class', 'filter-background')
            .attr('width', '100%')
            .attr('height', 58)
            ;

        /**
         * Resize chart if window sizes change
         */
        var _this = this;
        window.onresize = function (event) {
            width = document.getElementById('planing-component').offsetWidth;
            timeFilterChart.width(width);//.transitionDuration(0);
            //dc.redrawAll(mainGroup);
            _this.filterTime();
            timeFilterChart.render();
        };

        /**
         * Interface for changing the time range filter
         */
        this.replaceFilter = function (range) {
            timeFilterChart.replaceFilter(range);
        };

        /**
         * filterTime
         * @description Estimated the time range from the timeFilterChart and redefines the x-axis of the main chart arcodingly.
         * @param {*} chart 
         */
        this.filterTime = function (the_chart) {
            var range = timeFilterChart.filters()[0] === undefined ? this.xRange : timeFilterChart.filters()[0];
            // apply filter to main chart and milestone chart
            _this.milestoneApp.updateChart(range);
            for (var i = 0; i < registeredCharts.length; i++) {
                registeredCharts[i].update(range);
            }
        };

        var registeredCharts = [];
        /**
         * Register charts in order to update the selected x range
         */
        this.registerChart = function (chart) {
            registeredCharts.push(chart);
        };


    };

    return filterChart;
});