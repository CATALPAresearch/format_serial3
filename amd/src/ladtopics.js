/* eslint-disable spaced-comment */
/* eslint-disable require-jsdoc */
/**
 * Main method of the plugin. Load depending javascript and css before starting the timeline dashboard.
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      LADTopics
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define([
    'jquery',
    'jqueryui',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Timeline.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Utils.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/FilterChart.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ActivityChart.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/InitialSurvey.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Assessment.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Logging.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ICalExport.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
],
    function ($, jqueryui, Timeline, Utils, filterChart, activityChart, initialSurvey, Assessment, Log, ICalExport, ErrorHandler) {

        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/course/format/ladtopics/lib/",
            paths: {
                "vue259": ["https://cdn.jsdelivr.net/npm/vue@2.5.9/dist/vue", "vue"],
                "crossfilter": ["crossfilter"],
                "d3": ["d3.v4.min"],
                "dc": ["dc.v3"],
                "moment224": ["moment-with-locales-gz.min"], // ["moment.min"],
                "intro293": ["intro"],
                "sortable110": ["sortable.min"],
                "ICAL": ["ical.min"],
                "vDP": ["vDP"],
                "vDPde": ["vDPde"]
            },
            shim: {
                'vue259': {
                    exports: 'Vue'
                },
                "moment224": {
                    exports: 'moment'
                },
                "intro293": {
                    export: 'introJs'
                },
                "sortable110": {
                    exports: 'Sortable'
                },
                'crossfilter': {
                    exports: 'crossfilter'
                },
                'ICAL': {
                    exports: 'ICAL'
                },
                "vDP": {
                    exports: "vDP"
                },
                "vDPde": {
                    exports: "vDPde"
                }
            }
        });

        // hide unused div
        let box = $("#region-main-box");
        const h = box.outerHeight();
        box.change(function () {
            if (box.outerHeight() > h) {
                box.show();
            }
        });
        box.hide();

        function start(courseid) {
            // Add style sheets        
            var css = [
                M.cfg.wwwroot + "/course/format/ladtopics/css/ladtopics.css",
                M.cfg.wwwroot + "/course/format/ladtopics/css/dc.css",
                M.cfg.wwwroot + "/course/format/ladtopics/css/bootstrap-select.min.css",
                M.cfg.wwwroot + "/course/format/ladtopics/css/introjs.css"
            ];
            var link = '';
            for (var i = 0; i < css.length; i++) {
                link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = css[i];
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            // $('#accordion').tab();

            require([
                'vue259',
                'crossfilter',
                'd3',
                'dc',
                'moment224',
                'intro293',
                'sortable110',
                'ICAL',
                "vDP",
                "vDPde"
            ], function (vue, crossfilter, d3, dc, moment, intro, sortable, ICalLib, vDP, vDPde) {
                var utils = new Utils(dc, d3);
                var logger = new Log(utils, courseid, {
                    context: 'format_ladtopics',
                    outputType: 1 // 0: console, 1: logstore_standard_log
                });

                ErrorHandler.logger = logger;
                ErrorHandler.logWindowErrors();
                ErrorHandler.logConsoleErrors();

                new Timeline(
                    vue,
                    d3,
                    dc,
                    crossfilter,
                    moment,
                    sortable,
                    utils,
                    intro,
                    logger,
                    filterChart,
                    activityChart,
                    initialSurvey,
                    ICalExport,
                    ICalLib,
                    vDP,
                    vDPde,
                    ErrorHandler
                );
                // var t = new Assessment(vue, d3, dc, crossfilter, moment);
            });
        }

        return {
            init: function (courseid) {
                courseid = courseid === undefined ? parseInt($('#courseid').text(), 10) : courseid;
                start(courseid);
            }
        };
    });