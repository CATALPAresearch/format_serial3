/**
 * DashboardCompletion
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      DashboardCompletion
 * @copyright  2020 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @description Shows per course section a row of rectangles indicating the completion of assigned activities.
 * @license    MIT
 * @since      3.1
 * 
 * @todo
 * - display repetition of activities
 * - provide additional information for each activity using a popover or tooltip
 * - fix empty section names
 */

define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    // 'd3v4',
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/Utils.js"//,
    //M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
], function ($, Vue, Utils) {
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
                    //  $('a[href="#learningstatus"]').tab("show");
                    //$('[data-toggle="tooltip"]').tooltip();
                    //$('[data-toggle="popover"]').popover();
                    //});
                    /*
                    
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

                     */

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
                    <div v-for="(section, sIndex) in sections" class="row">
                        <div class="col-3">{{ section[0].sectionname }}</div>
                        <div class="col-9">
                            <div v-for="(m, index) in section" :class="m.completion==1 ? \'rect-green completion-rect\' : \'rect-blue completion-rect\'" @mouseover="setCurrent(index, sIndex)"></div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3"></div>
                        <div class="col-9">
                            <a v-bind:href="getLink()">
                                <span v-if="getCurrent().completion === 0"><i class="fa fa-times-rectangle"></i> {{ getCurrent().name }}, nicht abgeschlossen</span>
                                <span v-if="getCurrent().completion !== 0"><i class="fa fa-check"></i> {{ getCurrent().name }}, abgeschlossen</span>
                            </a>
                        </div>
                    </div>
                </div>`
        });
});