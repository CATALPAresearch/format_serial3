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
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/timeline.js', 
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/Utils.js', 
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/FilterChart.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ActivityChart.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/InitialSurvey.js'
],
    function ($, jqueryui, Timeline, Utils, filterChart, activityChart, initialSurvey) {

        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/course/format/ladtopics/lib/",
            paths: {
                "vue259": ["https://cdn.jsdelivr.net/npm/vue@2.5.9/dist/vue", "vue"],
                "crossfilter": ["crossfilter"],
                "d3": ["d3.v4.min"],
                "dc": ["dc.v3"],
                "reductio": ["https://rawgit.com/crossfilter/reductio/master/reductio", "reductio"],
                "universe": ["https://npmcdn.com/universe@latest/universe", "universe"],
                "bootstrap_select": ["https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.9/dist/js/bootstrap-select.min", "bootstrap-select.min"],
                "moment224": ["moment.min"],
                "sortable110": ["sortable.min"]
                /*
                "crossfilter2": "crossfilter.v2",
                "crossfilter": "https://cdnjs.cloudflare.com/ajax/libs/crossfilter/1.3.5/crossfilter",
                */
            },
            shim: {
                'vue259': {
                    exports: 'Vue'
                },
                "moment224": {
                    exports: 'moment'
                },
                "sortable110": {
                    exports: 'Sortable'
                },
                'crossfilter': {
                    exports: 'crossfilter'
                },
                'reductio': {
                    deps: ['d3', 'crossfilter'],
                    exports: 'reductio'
                },
                'universe': {
                    deps: ['d3', 'crossfilter'],
                    exports: 'universe'
                }

            }
        });


        function start() {
            // add style sheets        
            var css = [
                M.cfg.wwwroot + "/course/format/ladtopics/css/ladtopics.css",
                M.cfg.wwwroot + "/course/format/ladtopics/css/dc.css",
                M.cfg.wwwroot + "/course/format/ladtopics/css/bootstrap-select.min.css"
            ];
            var link = '';
            for (var i = 0; i < css.length; i++) {
                link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = css[i];
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            //$('#accordion').tab();

            require([
                'vue259',
                'crossfilter',
                'd3',
                'dc',
                'reductio',
                'universe',
                'bootstrap_select',
                'moment224',
                'sortable110'
            ], function (vue, crossfilter, d3, dc, reduction, universe, bselect, moment, sortable) {
                var utils = new Utils(dc, d3);
                new Timeline(vue, d3, dc, crossfilter, moment, sortable, utils, filterChart, activityChart, initialSurvey);
            });
        }

        return {
            init: function () {
                try {
                    start();
                } catch (e) {
                    console.error(e);
                }

            }
        };
    });