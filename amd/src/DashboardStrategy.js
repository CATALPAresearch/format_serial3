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
                    
                    info: '',
                    
                };
            },

            mounted: function () {
                var _this = this;
                
            },

            methods: {
                draw: function (data) {
                }
            },

            template: `
                <div id="dashboard-strategy">
                    Hello Strategy
                </div>`
        });
});