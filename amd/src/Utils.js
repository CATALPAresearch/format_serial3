/**
 * Javascript utils for the Moodle videodatabase
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Utils
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

require.config({
    enforceDefine: false,
    baseUrl: M.cfg.wwwroot + "/course/format/ladtopics/lib/build",
    paths: {
        "crossfilter": ["crossfilter.min"],
        "d3v4": ["d3.v4.min"], // upgrade to v5!
        "dc": ["dc.v3.min"]
    },
    shim: {
        'crossfilter': {
            exports: 'crossfilter'
        },
        'dc': {
            deps: ['d3v4', 'crossfilter']
        }
    }
});

define([
    'jquery', 
    'core/ajax', 
    'd3v4', 
    'dc', 
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
], function ($, ajax, d3, dc, ErrorHandler) {

    const Utils = function () {
        this.namex = 'utils';
        this.d3 = d3;
        this.dc = dc;

        ErrorHandler.logWindowErrors();
        ErrorHandler.logConsoleErrors();

        this.get_ws = function (ws, params, cb, external) {
            external = external === undefined ? false : external;
            ajax.call([{
                methodname: external ? ws : 'format_ladtopics_' + ws,
                args: params,
                done: function (msg) {
                    if (msg.hasOwnProperty('exception')) {
                        $('#alert')
                            .html('Die Prozedur ' + ws + ' konnte nicht als Webservice geladen werden.<br>')
                            .append(JSON.stringify(msg));
                    } else {
                        cb(msg);
                    }
                },
                fail: function (e) {
                    // eslint-disable-next-line no-console 
                    new ErrorHandler(e);

                }
            }]);
        };

        this.germanFormatters = d3.timeFormatDefaultLocale({
            "decimal": ",",
            "thousands": ".",
            "grouping": [3],
            "currency": ["€", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%d.%m.%Y",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": [
                "Sonntag",
                "Montag",
                "Dienstag",
                "Mittwoch",
                "Donnerstag",
                "Freitag",
                "Samstag"
            ],
            "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            "months": [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"],
            "shortMonths": ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
        });

        this.customTimeFormat = function (date) {
            // this.germanFormatters.timeFormat.multi([
            if (date.getMinutes()) { return d3.timeFormat("%I:%M")(date); }
            if (date.getMilliseconds()) { return d3.timeFormat(".%L")(date); }
            if (date.getSeconds()) { return d3.timeFormat(":%S")(date); }
            if (date.getHours()) { return d3.timeFormat("%Hh")(date); }
            if (date.getDay()) { return d3.timeFormat("%a %e.%m.")(date); } // Mo 8.02.
            if (date.getMonth()) { return d3.timeFormat("%B")(date); } //7.12. 
            return d3.getDate("%Y");

            /*   , function (d) { return d.; }],
                [ function (d) { return d.getDay() && d.getDate() !== 1; }], 
                ["%e.%m.", function (d) { return d.getDate() != 1; }], // 
                [, function (d) { return d.; }],
                [, function () { return true; }]
                */
        };

        this.monthRange = [
            { num: 1, name: 'Januar'},
            { num: 2, name: 'Feburar'},
            { num: 3, name: 'März'},
            { num: 4, name: 'April'},
            { num: 5, name: 'Mai'},
            { num: 6, name: 'Juni'},
            { num: 7, name: 'Juli'},
            { num: 8, name: 'August'},
            { num: 9, name: 'September'},
            { num: 10, name: 'Oktober'},
            { num: 11, name: 'November'},
            { num: 12, name: 'Dezember'}
        ];

        this.numberToWord = function (num, postfix) {
            postfix = postfix === undefined ? '' : postfix;
            switch (num) {
                case 0: return 'kein' + postfix;
                case 1: return 'ein' + postfix;
                case 2: return 'zwei' + postfix;
                case 3: return 'drei' + postfix;
                case 4: return 'vier' + postfix;
                case 5: return 'fünf' + postfix;
                case 6: return 'sechs' + postfix;
                case 7: return 'sieben' + postfix;
                case 8: return 'acht' + postfix;
                case 9: return 'neun' + postfix;
                case 10: return 'zehn' + postfix;
                case 11: return 'elf' + postfix;
                default: return num + ' ' + postfix;
            }
        };

        const locale = d3.timeFormatLocale({
            "decimal": ",",
            "thousands": ".",
            "grouping": [3],
            "currency": ["€", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%d.%m.%Y",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": [
                "Sonntag",
                "Montag",
                "Dienstag",
                "Mittwoch",
                "Donnerstag",
                "Freitag",
                "Samstag"],
            "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            "months": [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ],
            "shortMonths": [
                "Jan",
                "Feb",
                "Mär",
                "Apr",
                "Mai",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Okt",
                "Nov",
                "Dez"
            ]
        });

        this.formatMillisecond = locale.format(".%L");
        this.formatSecond = locale.format(":%S");
        this.formatMinute = locale.format("%I:%M");
        this.formatHour = locale.format("%H:%M");
        this.formatDay = locale.format("%a %e.%m.");
        this.formatDate = locale.format("%d.%m.%Y");
        this.formatDate2 = locale.format("%d/%m/%Y");
        this.formatWeek = locale.format("%b %d");
        this.formatWeekNum = locale.format("%U");
        this.formatMonth = locale.format("%B");
        this.formatYear = locale.format("%Y");


        this.multiFormat = function (date) {
            return d3.timeSecond(date) < date ? this.formatMillisecond
                : d3.timeMinute(date) < date ? this.formatSecond
                    : d3.timeHour(date) < date ? this.formatMinute
                        : d3.timeDay(date) < date ? this.formatHour
                            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? this.formatDay : this.formatWeek)
                                : d3.timeYear(date) < date ? this.formatMonth
                                    : this.formatYear; //(date);
        };

        /**
         * DC.js util to create filter charts. 
         * @param obj (Object) chartType, selector, indepVar, depVar, colors, margins
         * @param ndx 
         */
        this.addFilterChart = function (obj, ndx) {
            var filterSingleColors = this.d3.scale.ordinal().domain([0]).range(['#e6550d']);
            var filterChartHeight = 130;
            var dimension = ndx.dimension(function (d) { return d[obj.indepVar]; });
            var group = dimension.group().reduceSum(function (d) { return +d[obj.depVar]; });
            var margins = obj.margins === undefined ?
                { top: 0, right: 5, bottom: 20, left: 2 } :
                obj.margins;
            var colors = obj.colors === undefined ? filterSingleColors : obj.colors;
            var chart = '';

            switch (obj.chartType) {
                case 'rowChart':
                    chart = dc.rowChart(obj.selector);
                    chart.xAxis().ticks(4);
                    chart.margins(margins)
                        .height(filterChartHeight);
                    break;
                case 'pieChart':
                    chart = dc.pieChart(obj.selector);
                    chart.innerRadius(20)
                        .height(filterChartHeight - 30);
                    // Xxx, need to be abstracted
                    break;
            }
            chart
                .dimension(dimension)
                .group(group)
                .colors(colors)
                .title(function(p) {
                    return [
                        obj.indepVar.charAt(0).toUpperCase(),
                        obj.indepVar.slice(1, obj.indepVar.length),
                        ': ',
                        p.key,
                        '\n',
                        'Value: ',
                        p.value].join('');
                })
                .label(function(d) {
                    return obj.keys[d.key] || d.key;
                })
                ;
            this.register(chart);
        };



        this.charts = [];

        this.register = function (chart) {
            this.charts.push(chart);
        };

        this.resetCharts = function () {
            for (var i = 0; i < this.charts.length; i++) {
                this.charts[i].filterAll();
            }
            dc.redrawAll();
        };

        this.mergeObjects = function (obj1, obj2) {
            var obj3 = {};
            for (var attrname in obj1) {
                if (obj1.hasOwnProperty(attrname)) {
                    obj3[attrname] = obj1[attrname];
                }
            }
            for (var attrname in obj2) {
                if (obj2.hasOwnProperty(attrname)) {
                    obj3[attrname] = obj2[attrname];
                }
            }
            return obj3;
        };


    };

    return Utils;
});