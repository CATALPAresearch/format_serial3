
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

define([
], function () {

    /**
     * Render a survey form
     * @param milestoneApp (Object) Data Driven Documents
     * @param utils (Object) Custome util class
     */
    var survey = function (Vue, Sortable, milestoneApp, utils, course) {

        var surveyForm = new Vue({
            el: '#planningsurvey',
            data: function () {
                return {
                    modalSurveyVisible: false,
                    surveyComplete: false,
                    objectives: '',
                    availableTime: 0,
                    selectedMonth: 0,
                    selectedYear: 0,
                    resources: [],
                    availableResources: [],
                    invalidAvailableTime: false,
                    invalidObjective: false,
                    invalidResources: false
                };
            },
            mounted: function () {
                // obtain course structure form DB
                var _this = this;
                utils.get_ws('coursestructure', {
                    courseid: parseInt(course.id, 10)
                }, function (e) {
                    try {
                        _this.availableResources = JSON.parse(e.data);
                    } catch (e) {
                        console.error(e);
                    }
                });
                // load status
                if (localStorage.surveyComplete) {
                    //this.surveyComplete = localStorage.surveyComplete;
                }
            },
            watch: {
                surveyComplete: function (newStatus) {
                    localStorage.surveyComplete = newStatus;
                }
            },
            methods: {
                showModal: function (e) {
                    this.modalSurveyVisible = true;
                },
                closeModal: function (e) {
                    this.modalSurveyVisible = false;
                },
                monthRange: function () {
                    return [
                        { num: 1, name: 'Januar' },
                        { num: 2, name: 'Feburar' },
                        { num: 3, name: 'März' },
                        { num: 4, name: 'April' },
                        { num: 5, name: 'Mai' },
                        { num: 6, name: 'Juni' },
                        { num: 7, name: 'Juli' },
                        { num: 8, name: 'August' },
                        { num: 9, name: 'September' },
                        { num: 10, name: 'Oktober' },
                        { num: 11, name: 'November' },
                        { num: 12, name: 'Dezember' },
                    ];
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
                    if (this.objectives === 'f1c' && this.resources.length === 0 && this.availableResources.length > 0) {
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
                            if (this.selectedMonth !== today.getMonth() && this.selectedYear !== today.getFullYear()) {
                                ms.end = this.selectedMonth + '/1/' + this.selectedYear;//new Date(this.selectedYear, this.selectedMonth, 1, 0, 0, 0, 0);
                            } else {
                                ms.end = '2,1,2020';//new Date(2020, 2, 1, 0, 0, 0, 0 ); // last month of the semester as default
                            }
                            ms.resources = [];
                            ms.strategies = [];
                            milestoneApp.addMilestone(ms);
                            //milestones.push(ms);
                            //milestoneApp.milestones.push(ms);
                            break;
                        case 'f1b': // wants orientation
                            break;
                        case 'f1c': // wants certain topics
                            break;
                        case 'f1d': // doesn't want anything
                            break;
                    }

                    // set survey as done
                    milestoneApp.surveyDone = true;
                    this.surveyComplete = true;
                    $('#theSurveyModal').modal('hide');
                }
            }
        });
    };
    return survey;
});
