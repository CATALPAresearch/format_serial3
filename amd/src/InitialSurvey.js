/* eslint-disable space-before-function-paren */
/* eslint-disable spaced-comment */
/* eslint-disable capitalized-comments */
/* eslint-disable no-unused-vars */

/* eslint-disable valid-jsdoc */
/**
 * InitialSurvey
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      InitialSurvey
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define(['jquery'], function ($) {

    /**
     * Render a survey form
     * @param milestoneApp (Object) Data Driven Documents
     * @param utils (Object) Custome util class
     */
    var survey = function (Vue, Sortable, milestoneApp, utils, course) {

        new Vue({
            el: '#planningsurvey',
            data: function () {
                return {
                    modalSurveyVisible: false,
                    surveyComplete: false,
                    objectives: '',
                    availableTime: 0,
                    planingStyle: '',
                    selectedMonth: 0,
                    selectedYear: 0,
                    resources: [],
                    availableResources: [],
                    invalidAvailableTime: false,
                    invalidObjective: false,
                    invalidResources: false,
                    invalidPlaningStyle: false
                };
            },
            mounted: function () {
                // Obtain course structure form DB
                var _this = this;
                utils.get_ws('coursestructure', {
                    courseid: parseInt(course.id, 10)
                    // eslint-disable-next-line space-before-function-paren
                }, function (e) {
                    try {
                        _this.availableResources = JSON.parse(e.data);
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                    }
                });
                // load status
                utils.get_ws('userpreferences', {
                    data: {
                        'setget': 'get',
                        'fieldname': 'ladtopics_survey_done'
                    }
                }, function (e) {
                    try {
                        e = JSON.parse(e.response);
                        // console.log('got data from user pref ', e[0].value);
                        _this.surveyComplete = parseInt(e[0].value, 10) > 0 ? true : false;
                        milestoneApp.surveyDone = parseInt(e[0].value, 10);
                        if (milestoneApp.surveyDone > 0) {
                            $('#planing-component').show();
                        }
                        /* 
                        if (localStorage.surveyDone) {
                            this.surveyDone = localStorage.surveyDone;
                            if (this.surveyDone) {
                                $('#planing-component').show();
                            } 
                        }
                        */
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('Could not fetch user_preferences: ', e);
                    }

                });
                //if (localStorage.surveyComplete) {
                //localStorage.surveyComplete;
                //console.log('local ',localStorage.surveyComplete)
                //}
            },
            /*watchwatch: {
                surveyComplete: function (newStatus) {
                    //localStorage.surveyComplete = newStatus;
                }
            },*/
            created: function () {
                $('#planningsurvey').show();
            },
            methods: {
                showModal: function (e) {
                    this.modalSurveyVisible = true;
                },
                closeModal: function (e) {
                    this.modalSurveyVisible = false;
                },
                monthRange: function () {
                    return utils.monthRange;
                },
                yearRange: function () {
                    return [2019, 2020, 2021, 2022]; // xxx should become a plugin setting
                },
                monthSelected: function (event) {
                    this.selectedMonth = event.target.value;
                },
                yearSelected: function (event) {
                    this.selectedYear = event.target.value;
                },
                resourcesBySection: function (id) {
                    return this.availableResources.filter(function (s) {
                        return parseInt(s.section_id, 10) === parseInt(id, 10) ? true : false;
                    });
                },
                resourceSections: function () {
                    var sections = {};
                    for (var i = 0; i < this.availableResources.length; i++) {
                        sections[this.availableResources[i].section_id] = {
                            name: this.availableResources[i].section_name === ' ' ?
                                '(Einführung)' :
                                this.availableResources[i].section_name,
                            id: this.availableResources[i].section_id
                        };
                    }
                    return sections;
                },
                resourceById: function (id) {
                    return this.availableResources.filter(function (s) {
                        return parseInt(s.id, 10) === parseInt(id, 10) ? true : false;
                    })[0];
                },
                resourceSelected: function (event) {
                    this.resources.push(this.resourceById(event.target.value));
                    var el = document.getElementById('selected_resources');
                    var sor = Sortable.create(el, {});
                    this.invalidResources = this.resources.length > 0 ? false : true;
                },
                resourceRemove: function (id) {
                    for (var s = 0; s < this.resources.length; s++) {
                        if (this.resources[s].id === id) {
                            this.resources.splice(s, 1);
                        }
                    }
                    this.invalidResources = this.resources.length > 0 ? false : true;
                },
                updateObjective: function (e) {
                    this.invalidObjective = this.objectives === '' ? true : false;
                },
                updateAvailableTime: function () {
                    this.invalidAvailableTime = this.availableTime <= 0 ? true : false;
                },
                updatePlaningStyle: function (e) {
                    this.invalidPlaningStyle = this.planingStyle === '' ? true : false;
                },
                validateSurveyForm: function () {
                    var isValid = true;
                    if (this.objectives === '') {
                        this.invalidObjective = true;
                        isValid = false;
                    }
                    if (this.availableTime <= 0) {
                        this.invalidAvailableTime = true;
                        isValid = false;
                    }
                    if (this.planingStyle === '') {
                        this.invalidPlaningStyle = true;
                        isValid = false;
                    }
                    if (this.objectives === 'f1c' && this.resources.length === 0 &&
                        this.availableResources.length > 0
                    ) {
                        this.invalidResources = true;
                        isValid = false;
                    }
                    if (isValid) {
                        this.saveSurvey();
                    }
                    //return ! isValid;
                },
                saveSurvey: function () {
                    var today = new Date();
                    var milestones = [];
                    var milestoneTemplate = {};
                    var ms = {};

                    // generate milestones automatically
                    switch (this.objectives) {
                        case 'f1a': // wants examination
                            ms = Object.assign({}, milestoneTemplate, {});
                            ms.name = "Prüfung / Klausur";
                            ms.objective = "Die Prüfung sehr gut bestehen";
                            if (this.selectedMonth !== today.getMonth() &&
                                this.selectedYear !== today.getFullYear()
                            ) {
                                ms.end = Date.parse('' + this.selectedYear + ',' + this.selectedMonth + ',1');
                            } else {
                                ms.end = Date.parse("2020,2,1"); // last month of the semester as default

                            }
                            //console.log("2020,2,1", new Date("2020, 2, 1"));
                            ms.resources = [];
                            ms.strategies = [];
                            milestoneApp.addMilestone(ms);

                            var biwiPlaningPruefung = [];

                            //milestones.push(ms);
                            //milestoneApp.milestones.push(ms);
                            break;
                        case 'f1b': // wants orientation
                            var biwiPlaningOrientation = [];
                            break;
                        case 'f1c': // wants certain topics
                            break;
                        case 'f1d': // doesn't want anything
                            break;
                    }
                    var _this = this;
                    // set survey as done
                    utils.get_ws('userpreferences', {
                        data: {
                            'setget': 'set',
                            'fieldname': 'ladtopics_survey_done',
                            'value': 1
                        }
                    }, function (e) {
                        try {
                            e = JSON.parse(e.response);
                            // console.log('got data from user pref ', e);
                            milestoneApp.surveyDone = 1;
                            this.surveyComplete = true;
                            $('#theSurveyModal').modal('hide');
                            $('#planing-component').show();
                            utils.get_ws('userpreferences', {
                                data: {
                                    'setget': 'set',
                                    'fieldname': 'ladtopics_survey_results',
                                    'value': JSON.stringify({
                                        objectives: _this.objectives,
                                        availableTime: _this.availableTime,
                                        planingStyle: _this.planingStyle,
                                        selectedMonth: _this.selectedMonth,
                                        selectedYear: _this.selectedYear,
                                        resources: _this.resources//,
                                        //availableResources: _this.availableResources
                                    })
                                }
                            }, function (e) {
                                // console.log('saved survey ', e);
                            });

                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('Could not fetch user_preferences: ', e);
                        }

                    });

                }
            }
        });
    };
    return survey;
});
