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
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/utils/Utils.js"
], function ($, Vue, Utils) {
    Utils = new Utils();
    return Vue.component('dashboard-completion',
        {
            props: ['course', 'log'],

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
                    // console.log(this.sections);
                },
                setCurrent: function (id, section) {
                    this.current = { id: id, section: section };
                    this.$emit('log', 'dashboard_completion_item_hover', { url: this.getLink(), completion: this.getCurrent().completion });
                },
                getCurrent: function () {
                    return this.sections[this.current.section][this.current.id];
                },
                getLink: function (instance) {
                    instance = instance == undefined ? this.getCurrent() : instance;
                    return '/mod/' + instance.type + '/view.php?id=' + instance.id;
                },
                getStatus: function (instance) {
                    instance = instance == undefined ? this.getCurrent() : instance;
                    return instance.completion === 0 ? '<i class="fa fa-times-square"></i>Nicht abgeschlossen' : '<i class="fa fa-check"></i> Abgeschlossen';
                },
                trackClick: function () {
                    let instance = this.getCurrent();
                    this.$emit('log', 'dashboard_completion_item_click', { type: instance.type, instance: instance.id });
                }
            },

            template: `
                <div id="dashboard-completion">
                    <p class="w-75" style="font-size:0.9em">Anhand dieser Balken können Sie erkennen, welche Lernangebote Sie bereits genutzt haben. Jedes Kästchen steht für ein Lernangebot, welches Sie durch einen Klick aufrufen können.</p>
                    <div v-for="(section, sIndex) in sections" class="row">
                        <div class="col-3" style="font-size:0.9em">{{ section[0].sectionname }}</div>
                        <div class="col-9">
                            <span v-for="(m, index) in section">
                                <a v-bind:href="getLink()" v-on:click="trackClick()" v-if="m.type !== 'label' && m.type !== 'headline'" :class="m.completion==1 ? \'rect-green completion-rect\' : \'rect-blue completion-rect\'" @mouseover="setCurrent(index, sIndex)"></a>
                            </span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3"></div>
                        <div class="col-9">
                            <a v-bind:href="getLink()" v-on:click="trackClick()">
                                <span v-if="getCurrent().completion === 0">
                                    <i class="fa fa-times-rectangle"></i> {{ getCurrent().name }}, nicht abgeschlossen
                                </span>
                                <span v-if="getCurrent().completion !== 0">
                                    <i class="fa fa-check"></i> {{ getCurrent().name }}, abgeschlossen
                                </span>
                            </a>
                        </div>
                    </div>
                </div>`
        });
});