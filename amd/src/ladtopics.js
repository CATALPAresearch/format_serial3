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
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Timeline.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Utils.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/FilterChart.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ActivityChart.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/InitialSurvey.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Logging.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
],
    function ($, Timeline, Utils, filterChart, activityChart, initialSurvey, Log, ErrorHandler) {

        require.config({
            enforceDefine: false,
            paths: {
                //"crossfilter": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/crossfilter.min"],
                //"d3": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/d3.v4.min"], // upgrade to v5!
                //"dc": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/dc.v4.min"],
                "d3": [M.cfg.wwwroot + "/course/format/ladtopics/lib/src/d3.v4"], // upgrade to v5!
                "crossfilter": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/crossfilter.min"],
                "dc": [M.cfg.wwwroot + "/course/format/ladtopics/lib/src/dc.v3"],
                "moment226": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/moment-with-locales.min"], // ["moment.min"],
                "intro293": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/intro.min"],
                "ICAL": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/ical.min"],
                "vDP": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vDP.min"],
                "vDPde": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vDPde.min"]
            },
            shim: {
                'dc': {
                    deps: ['d3', 'crossfilter']
                },
                "moment226": {
                    exports: 'moment'
                },
                "intro293": {
                    export: 'introJs'
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
        console.log(33)
        // hide unused div
        let box = $("#region-main-box");
        const h = box.outerHeight();
        box.change(function () {
            if (box.outerHeight() > h) {
                box.show();
            }
        });
        //box.hide();

        function start(courseid) {

            require([
                'crossfilter',
                'd3',
                'dc',
                'moment226',
                'intro293',
                "vDP",
                "vDPde"
            ], function (crossfilter, d3, dc, moment, intro, vDP, vDPde) {
                ErrorHandler.logger = logger;
                ErrorHandler.logWindowErrors();
                ErrorHandler.logConsoleErrors();

                var utils = new Utils();
                var logger = new Log(courseid, {
                    context: 'format_ladtopics',
                    outputType: 1 // 0: console, 1: logstore_standard_log
                });
                new Timeline(
                    d3,
                    dc,
                    crossfilter,
                    moment,
                    utils,
                    intro,
                    logger,
                    filterChart,
                    activityChart,
                    initialSurvey,
                    vDP,
                    vDPde,
                    ErrorHandler
                );
            });
        }

        return {
            init: function (courseid) {
                courseid = courseid === undefined ? parseInt($('#courseid').text(), 10) : courseid;
                start(courseid);
            }
        };
    });