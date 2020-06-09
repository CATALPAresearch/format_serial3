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
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/Utils.js"//,
    //M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
], function ($, Vue, d3, Utils) {
    Utils = new Utils();
    return Vue.component('dashboard-completion',
        {
            props: ['course'],

            data: function () {
                return {
                    sections: [],
                    info: '',
                    current: { id: 0, section: 0 }
                };
            },

            mounted: function () {
                var _this = this;
                // get data
                Utils.get_ws('completionprogress', {
                    'courseid': parseInt(this.course.id, 10)
                }, function (e) {

                    try {
                        //console.log(JSON.parse(e.activities));
                        //console.log(JSON.parse(e.completions));
                        _this.draw(JSON.parse(e.completions));
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                    }
                });
            },

            methods: {
                draw: function (data) {
                    /*var svgContainer = d3.select("#completion-chart").append("svg")
                        .attr("width", 200)
                        .attr("height", 200);*/
                    var groupBy = function (data, key) {
                        var arr = [];
                        for (var val in data) {
                            arr[data[val][key]] = arr[data[val][key]] || [];
                            arr[data[val][key]].push(data[val]);
                        }
                        return arr.filter(function (el) {
                            return el !== null;
                        });
                    };
                    this.sections = groupBy(data, 'section');
                    //$(document).ready(function () {
                    //$('[data-toggle="tooltip"]').tooltip();
                    //$('[data-toggle="popover"]').popover();
                    //});
                    console.log(this.sections);
                },
                setCurrent: function (id, section) {
                    this.current = { id: id, section: section };
                },
                getCurrent: function () {
                    return this.sections[this.current.section][this.current.id];
                },
                getLink: function (instance) {
                    instance = instance == undefined ? this.getCurrent() : instance;
                    return '/moodle/mod/' + instance.type + '/view.php?id=' + instance.id;
                },
                getStatus: function (instance) {
                    instance = instance == undefined ? this.getCurrent() : instance;
                    return instance.completion === 0 ? '<i class="fa fa-times-square"></i>Nicht abgeschlossen' : '<i class="fa fa-check"></i> Abgeschlossen';
                }
            },

            template: `
                <div id="dashboard-completion">
                    <div id="completion-chart">
                        <svg style="border: none;">
                            <g transform="translate(0,10)" id="dashboard-completion">
                                <g v-for="(section, sIndex) in sections">
                                    <g :transform="'translate(0,' + (30*sIndex+14) +')'">
                                        <text class="completion-section-name">{{ section[0].sectionname }}</text>
                                    </g>
                                    <g v-for="(m, index) in section" :transform="'translate(70,' + (1*sIndex) +')'">
                                    <a
                                        data-toggle="tooltip" 
                                        data-container="body" 
                                        :title="m.type" 
                                        data-content="m.name" 
                                        data-placement="top">
                                            <rect @mouseover="setCurrent(index, sIndex)" class="completion-rect"
                                                :x="index * 20" 
                                                :y="sIndex*30" 
                                                :height="20" 
                                                :width="20"
                                                :fill="m.completion==1 ? \'green\' : \'blue\'"
                                                data-toggle="popover" 
                                                data-container="body" 
                                                :title="m.type" 
                                                :data-content="m.name" 
                                                data-placement="bottom"
                                                >
                                        </a>
                                        </g>
                                    </rect>
                                </g>
                                <g transform="translate(20,100)" class="completion-info">
                                    
                                </g>
                            </g>
                        </svg>
                        <div>
                            <a v-bind:href="getLink()">
                                <span v-if="getCurrent().completion === 0"><i class="fa fa-times-rectangle"></i> {{ getCurrent().name }}, nicht abgeschlossen</span>
                                <span v-if="getCurrent().completion !== 0"><i class="fa fa-check"></i> {{ getCurrent().name }}, abgeschlossen</span>
                            </a>
                        </div>
                    </div>
                </div>`
        });
});

// class="mod-icon-' + getCurrent().type + '" 