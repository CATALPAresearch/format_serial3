/* eslint-disable spaced-comment */
/* eslint-disable require-jsdoc */
/**
 * Main method of the plugin. Load depending javascript and css before starting the timeline dashboard.
 *
 * @module     format/ladtopics
 * @class      LADTopics
 * @copyright  2019 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 * 
 * TODO
 * - set link to policy text
 * - submit accept/withdraw
 */
define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/moment-with-locales.min.js"

],
    function ($, Vue, moment) {

        require.config({
            enforceDefine: false,
            paths: {
                "moment226": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/moment-with-locales.min.js"],
            },
            shim: {
                "moment226": {
                    exports: 'moment'
                }
            }
        });

        return {
            init: function (policies, message) {
                return new Vue({
                    el: 'policy-container',

                    data: function () {
                        return {
                            policies: policies,
                            message: message
                        }
                    },

                    mounted: function () {
                        
                    },

                    methods:{
                        accept: function(){

                        },
                        convertTime: function(utc){
                            return moment.unix(utc).format("DD.MM.YYYY");
                        },
                        getLink: function(p, action){
                            return M.cfg.wwwroot + '/course/format/ladtopics/policy.php?policy='+p.id+'&version='+p.version+'&action='+action;
                        }
                    },

                    template: `
                            <div id="policy-container">
                                <h3 class="my-4">Zustimmung und Wideruf von Richtlinien</h3>
                                <div v-if="message != ''" class="alert alert-success w-50">
                                    Ihre Änderungen wurden umgesetzt.
                                </div>
                                <div class="row mb-3 border-bottom pb-2" v-for="p in policies">
                                    <div class="col-10">
                                        <a target="s" class="bold">{{p.name}}</a> in der Version vom 
                                        <span>{{ convertTime(p.creation) }}</span>
                                        <span v-if="p.status==1">haben Sie am {{ convertTime(p.acceptance) }} zugestimmt <i class="fa fa-check ml-3"></i></span>
                                        <span v-if="p.status==0">
                                            <i class="fa fa-times ml-3"></i>
                                        </span>
                                    </div>
                                    <div class="col-2">
                                        <span v-if="p.status==1">
                                            <a :href="getLink(p,0)" class="right btn btn-sm btn-outline-primary">Zustimmung widerufen</a>
                                        </span>
                                        <span v-if="p.status==0">
                                            <a :href="getLink(p,1)" class="btn btn-sm btn-primary">Akzeptieren</a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `

                });
            }
        };
    });