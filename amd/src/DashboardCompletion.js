require.config({
    enforceDefine: false,
    baseUrl: M.cfg.wwwroot + "/course/format/ladtopics/lib/build/",
    paths: {
        "d3v4": ["d3.v4.min"], // upgrade to v5!
        //"vue": ["vue.min"]
    },
    shim: {}
});

define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    'd3v4',
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/Utils.js",
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
], function ($, Vue, d3, Utils, ErrorHandler) {
        
    return Vue.component('dashboard-completion',
        {
            props: ['course'],

            data: function () {
                return {

                };
            },

            mounted: function () {
                var _this = this;
                // get data
                Utils.get_ws('completionprogress', {
                    'courseid': parseInt(this.course.id, 10)
                }, function (e) {
                    try {
                        console.log(JSON.parse(e.activities));
                        //console.log(JSON.parse(e.completions));
                        _this.draw(JSON.parse(e.completions));
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                    }
                });
            },

            methods: {
                draw: function (data) { console.log('draw')
                    var svgContainer = d3.select("#completion-chart").append("svg")
                        .attr("width", 200)
                        .attr("height", 200);

                    //Draw the Rectangle
                    var rectangle = svgContainer.append("rect")
                        .attr("x", 10)
                        .attr("y", 10)
                        .attr("width", 50)
                        .attr("height", 100);
                }
            },

            template: '<div id="dashboard-completion"><div id="completion-chart">Hallo Lernstand</div></div>'
        });
});