/* eslint-disable no-unused-vars */
/* eslint-disable capitalized-comments */
/* eslint-disable space-before-function-paren */
/* eslint-disable valid-jsdoc */
/**
 * FilterChart
 *
 * @module     format/serial3
 * @package    format_serial3
 * @class      Timeline
 * @copyright  2020 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define(['jquery'], function ($) {
    var timeFilterChart = '';
    var filterChart = function (d3, dc, crossfilter, facts, xRange, milestoneApp, utils, log, courseSettings) {
         
        timeFilterChart = dc.compositeChart("#filter-chart");
        this.xRange = xRange;
        this.milestoneApp = milestoneApp;
        var width = document.getElementById('serial3-container-0').offsetWidth;
        var margins = { top: 15, right: 10, bottom: 20, left: 10 };
        var color_ms_status_range = ["#ffa500", "ff420e", "#80bd9e", "#89da59", "#004C97"];


        // FILTER CHART
        var semesterLimit = crossfilter([{ date: courseSettings.startDate, y: 1 }, { date: courseSettings.endDate, y: 1 }]);
        var timeFilterLimitDim = semesterLimit.dimension(function (d) { return d.date; });
        var timeFilterLimitGroup = timeFilterLimitDim.group().reduceCount(function (d) { return [0, d.date, 1]; });

        var timeFilterDim = facts.dimension(function (d) { return d.date; });
        var timeFilterGroup = timeFilterDim.group().reduceCount(function (d) { return d.date; });

        // include Milestone data
        var milestoneData = milestoneApp.getMilestones(); 
        for (var i = 0; i < milestoneData.length; i++) {
            milestoneData[i].y = i % 3 + 1;
        }
        var msData = crossfilter(milestoneData);
        var msFilterDim = msData.dimension(function (d) {
            return [d.status, d.end, d.y];
        });
        var msFilterGroup = msFilterDim.group().reduceCount(function (d) { return d.end; });

        timeFilterChart
            .width(width)
            .height(85)
            .margins({ top: 10, bottom: 15, left: margins.left - 10, right: margins.right })
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
                        return new Date(p.key[1]); // date
                    })
                    .valueAccessor(function (p) {
                        return p.key[2]; // size
                    })
                    .radiusValueAccessor(function () {
                        return 1.4;
                    })
                    .colors(
                        d3.scaleOrdinal()
                            .domain(["urgent", "missed", "progress", "ready", "refelcted"])
                            .range(color_ms_status_range))
                    .colorAccessor(function (d) { 
                        return d.key[0]; 
                    })
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
        timeFilterChart.xAxis(d3.axisBottom().ticks(10));


        var _this = this;
        timeFilterChart.on('filtered', function () {
            _this.filterTime(_this);
        });// other events: preRender, preRedraw

        timeFilterChart.on('renderlet', function (chart) {
            d3.select('#filter-chart svg rect.selection').on('mouseup', function () {
                //log.add('timefilter_changed', { range: 3 });
            });
            d3.select('#filter-chart svg rect.selection').on('mousedown', function () {
                //log.add('timefilter_changed', { range: 300 });
            });

            d3.select('#filter-chart svg rect.overlay').on('mousedown', function () {
                log.add('timefilter_changed', {
                    range: timeFilterChart.filters()[0] === undefined ? this.xRange : timeFilterChart.filters()[0]
                });
            });
        });

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

        if (localStorage.surveyDone) {
            $('.activity-chart-container').show();
            $('.filter-chart-container').show();
        } else {
            $('.activity-chart-container').hide();
            $('.filter-chart-container').hide();
        }

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
         * @description Obtain the time range from the timeFilterChart and redefines the x-axis of the main chart arcodingly.
         * @param {*} chart 
         */
        this.filterTime = function (the_chart) {
            var range = timeFilterChart.filters()[0] === undefined ? this.xRange : timeFilterChart.filters()[0];
            // limit range to semester
            range[0] = range[0].getTime() <= courseSettings.start * 1000 || range[0].getTime() > courseSettings.end * 1000 ? new Date(courseSettings.start * 1000) : range[0]; 
            range[1] = range[1].getTime() > courseSettings.end * 1000 ? new Date(courseSettings.end * 1000) : range[1]; 
            // apply filter to main chart and milestone chart
            _this.milestoneApp.updateChart(range);
            
            for (var i = 0; i < registeredCharts.length; i++) {
                registeredCharts[i].update(range);
            }
            log.add('timefilter_changed', { range: range });
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