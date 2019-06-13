/**
 * Javascript controller for Vue.js and Vi-Two
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      LADTopics
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */
define([
    'jquery', 'jqueryui', '/moodle/course/format/ladtopics/amd/src/timeline.js', '/moodle/course/format/ladtopics/amd/src/Utils.js'
],
    function ($, jqueryui, Timeline, Utils) {
        require.config({
            baseUrl:"/moodle/course/format/ladtopics/lib/",
            paths: {
                "crossfilter": "crossfilter",
                "d3": "d3",
                "dc": "dc",
                "reductio": "reductio",
                "universe": "universe"
                /*
                "crossfilter": "https://cdnjs.cloudflare.com/ajax/libs/crossfilter/1.3.5/crossfilter",
                "d3": "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3",
                "dc": "https://cdnjs.cloudflare.com/ajax/libs/dc/2.1.0-dev/dc",
                "reductio": "https://rawgit.com/crossfilter/reductio/master/reductio",
                "universe": "https://npmcdn.com/universe@latest/universe"
                */
            },
            shim: {
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
                        "/course/format/ladtopics/css/bootstrap.min.css",
                        "/course/format/ladtopics/css/ladtopics.css"
                    ];
                    for(var i=0; i< css.length;i++){
                        var link = document.createElement("link");
                        link.rel = "stylesheet";
                        link.type = "text/css";
                        link.href = css[i];
                        document.getElementsByTagName("head")[0].appendChild(link);
                    }
                //})();
            
            $('#accordion').tab();


            require(['crossfilter', 'd3', 'dc', 'reductio', 'universe'], function (crossfilter, d3, dc, reduction, universe) {
               
                const utils = new Utils(dc, d3);
                new Timeline(d3, dc, utils);

                /*$(document.body).append('<div id="timeline"></div>');
                
                var chart = dc.barChart("#timeline");
               
                var experiments = [{
                    "Run": 300,
                    "Speed": 100
                },
                {
                    "Run": 330,
                    "Speed": 600
                },
                {
                    "Run": 333,
                    "Speed": 500
                },
                {
                    "Run": 400,
                    "Speed": 400
                }];
                experiments = data.data;
                
                $.each(experiments, function (i, x) {
                    x.glossary = x.action;
                    let d = new Date(0);
                    x.date = new Date(d.setUTCSeconds(x.utc));
                });
                console.log(experiments);
                var ndx = crossfilter(experiments),
                    dateDimension = ndx.dimension(function (d) { return +d.date; }),
                    glossarySumGroup = dateDimension.group().reduceSum(function (d) { return d.utc; });
                
                var xRange = [d3.min(glossarySumGroup.all(), function (d) { return d.utc; }), d3.max(glossarySumGroup.all(), function (d) { return d.utc; })];
                console.log(glossarySumGroup)
                chart
                    .width(768)
                    .height(200)
                    .x(d3.scale.linear().domain(xRange))
                    .brushOn(false)
                    .yAxisLabel("This is the Y Axis!")
                    .dimension(dateDimension)
                    .group(glossarySumGroup)
                    .on('renderlet', function (chart) {
                        chart.selectAll('rect').on("click", function (d) {
                            console.log("click!", d);
                        });
                    });
                chart.render();

*/

            });
        }
        return {
            init: function () {
                try{
                    start();
                }catch(e){
                    console.error(e);
                }
                
            }
        };
    }); 