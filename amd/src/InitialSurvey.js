/* eslint-disable space-before-function-paren */
/* eslint-disable spaced-comment */
/* eslint-disable capitalized-comments */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

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
        var biwiCourse = 2;// 3
        var csCourse = 3;// 2
        var courseid = parseInt($('#courseid').text(), 10);

        $.get('somefile.json', function (data) {
            // do something with your data
        });

        var milestonePresets = {};
        milestonePresets.biwi = {};
        
        milestonePresets.biwi.exame = [];
        milestonePresets.biwi.orientation = [];
        milestonePresets.cs = {};
        milestonePresets.cs.exame = [];
        milestonePresets.cs.orientation = [];


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
                    invalidAvailableTimeNotEnough: false,
                    invalidObjective: false,
                    invalidResources: false,
                    invalidPlaningStyle: false
                };
            },
            mounted: function () {
                // Obtain course structure form DB
                var _this = this;
                utils.get_ws('coursestructure', {
                    courseid: parseInt(course.id, 10),    
                    select: {    
                        modules: JSON.stringify([
                            "assign", 
                            "data", 
                            "hvp", 
                            "checklist", 
                            "url", 
                            "studentquiz", 
                            "page", 
                            "feedback",
                            "forum",
                            "resource",
                            "glossary",
                            "quiz",
                            "wiki"
                        ])                            
                    }                 
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
                        'fieldname': 'ladtopics_survey_done',
                        'courseid': parseInt(course.id, 10)
                    }
                }, function (e) {
                    try {
                        e = JSON.parse(e.response);
                        console.log('got data from user pref ', e);
                        if (e[0]) {
                            if (parseInt(e[0].value, 10)) {
                                _this.surveyComplete = parseInt(e[0].value, 10) > 0 ? true : false;
                                milestoneApp.surveyDone = parseInt(e[0].value, 10);
                            }
                        }

                        if (milestoneApp.surveyDone > 0) {
                            $('#planing-component').show();
                        } else {
                            $('#planningsurvey').show();
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
                //$('#planningsurvey').show();
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
                    //console.log('selected ress ', this.resourceById(event.target.value), event.target.value);
                    var id = -1;
                    if (event.target.value.match(/complete-section-\d/i)) {
                        id = -99;
                        //  "id": 13, "course_id": "3", "module_id": "9", "section_id": "6", "section_name": " ", "instance_id": "2", "instance_url_id": "2", "instance_type": "forum", "instance_title": "Nachrichtenforum", "section": "6", "name": "Nachrichtenforum" 
                    } else {
                        id = this.resourceById(event.target.value);
                    }
                    this.resources.push(id);
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
                    this.invalidAvailableTimeNotEnough = this.availableTime <= 10 ? true : false;
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
                isAvailableTimeSufficient: function () {
                    if (this.availableTime <= 0) {
                        return "";
                    } else if (this.objective === "f1a" && this.availableTime === 1) {
                        return "Eine Stunde pro Woche ist zu wenig Zeit, um sich auf die Prüfung vorzubereiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.objective === "f1a" && this.availableTime > 1 && this.availableTime <= 10) {
                        return this.availableTime + " Stunden pro Woche sind zu wenig Zeit, um sich auf die Prüfung vorzubereiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.objective !== "f1a" && this.availableTime === 1) {
                        return "Eine Stunde pro Woche ist zu wenig Zeit, um das Modul in einem Semester durchzuarbeiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.objective !== "f1a" && this.availableTime > 1 && this.availableTime <= 10) {
                        return this.availableTime + " Stunden pro Woche sind zu wenig Zeit, um das Modul in einem Semester durchzuarbeiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.availableTime >= 30) {
                        return "Wollen Sie wirklich " + this.availableTime + " Stunden pro Woche aufwenden? Normalerweise benötigt man ca. 20 h/Woche für eine gute Vorbereitung.";
                    }
                },
                saveSurvey: function () {
                    // generate milestones automatically
                    switch (this.objectives) {
                        case 'f1a': // wants examination
                            if (courseid === biwiCourse) {
                                milestoneApp.addMilestones(milestonePresets.biwi.exame);
                            } else if (courseid === csCourse) {
                                milestoneApp.addMilestones(milestonePresets.cs.exame);
                            }
                            break;
                        case 'f1b': // wants orientation
                            if (courseid === biwiCourse) {
                                milestoneApp.addMilestones(milestonePresets.biwi.orientation);
                            } else if (courseid === csCourse) {
                                milestoneApp.addMilestones(milestonePresets.cs.orientation);
                            }
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
                            'courseid': parseInt(course.id, 10),
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
                            $('.survey-btn').hide();
                            utils.get_ws('userpreferences', {
                                data: {
                                    'setget': 'set',
                                    'courseid': parseInt(course.id, 10),
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
