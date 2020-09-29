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
 * @copyright  2019 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */

define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/Sortable.min.js"
], function ($, Vue, Sortable) {

    /**
     * Render a survey form
     * @param milestoneApp (Object) Data Driven Documents
     * @param utils (Object) Custome util class
     */
    var survey = function (milestoneApp, utils, course) {
        
        new Vue({
            el: 'initial-survey',
            data: function () {
                return {
                    modalSurveyVisible: false,
                    surveyComplete: false,
                    objectives: '',
                    availableTime: 0,
                    planingStyle: '',
                    selectedMonth: -1,
                    selectedYear: -1,
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
                }, function (e) {
                    try {
                        var data = JSON.parse(e.data);
                        // Sort Ressources
                        var obj = new Array(data.length);
                        for (var i in data) {
                            var pos = 0;
                            for (var x in data) {
                                if (data[i] === data[x]) continue;
                                if (+data[x].pos_section < +data[i].pos_section) {
                                    pos++;
                                    continue;
                                }
                                if (+data[x].pos_module < +data[i].pos_module) {
                                    pos++;
                                    continue;
                                }
                            }
                            while (typeof obj[pos] === "object") {
                                pos++;
                            }
                            obj[pos] = data[i];
                        }
                        _this.availableResources = obj;
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
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('Could not fetch user_preferences: ', e);
                    }

                });
            },
            created: function () {
                //$('#planningsurvey').show();
                this.showModal();
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
                    return [2021, 2022, 2023, 2024]; // xxx should become a plugin setting
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
                    console.log('update ', this.objectives, this.invalidObjective)
                },
                updateAvailableTime: function () {
                    this.invalidAvailableTime = this.availableTime <= 0 ? true : false;
                    this.invalidAvailableTimeNotEnough = this.availableTime <= course.minimumWeeklyWorkload ? true : false;
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
                    /*if (this.objectives === 'f1c' && this.resources.length === 0 &&
                        this.availableResources.length > 0
                    ) {
                        this.invalidResources = true;
                        isValid = false;
                    }*/
                    if (isValid) {
                        this.saveSurvey();                        
                    }
                    //return ! isValid;
                },
                isAvailableTimeSufficient: function () {
                    if (this.availableTime <= 0) {
                        return "";
                    } else if (this.objectives === "f1a" && +this.availableTime === 1) {
                        return "Eine Stunde pro Woche ist zu wenig Zeit, um sich auf die Prüfung vorzubereiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.objectives === "f1a" && this.availableTime > 1 && this.availableTime <= course.minimumWeeklyWorkload) {
                        return this.availableTime + " Stunden pro Woche sind zu wenig Zeit, um sich auf die Prüfung vorzubereiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.objectives !== "f1a" && this.availableTime === 1) {
                        return "Eine Stunde pro Woche ist zu wenig Zeit, um das Modul in einem Semester durchzuarbeiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.objectives !== "f1a" && this.availableTime > 1 && this.availableTime <= course.minimumWeeklyWorkload) {
                        return this.availableTime + " Stunden pro Woche sind zu wenig Zeit, um das Modul in einem Semester durchzuarbeiten. Der Arbeitsaufwand für ein Modul beträgt 19h pro Woche.";
                    } else if (this.availableTime >= course.maximumWeeklyWorkload) {
                        return "Wollen Sie wirklich " + this.availableTime + " Stunden pro Woche aufwenden? Normalerweise benötigt man ca. 20 h/Woche für eine gute Vorbereitung.";
                    }
                },
                buttonText: function () {
                    var text = 'Fortfahren';

                    var reason = {
                        'f1a': 'Semesterplanung für die Prüfungsvorbereitung vorschlagen',
                        'f1b': 'Semesterplanung für eine erste Orientierung vorschlagen',
                        'f1c': 'Fortfahren',
                        'f1d': 'Fortfahren'
                    };
                    /*
                    var takt = {
                        'planing-style-a': 'im Wochentakt',
                        'planing-style-b': 'im 4-Wochentakt',
                        'planing-style-c': 'im Wochentakt',
                        'planing-style-d': 'im 2-Wochentakt',
                        'planing-style-e': 'im Monatstakt',
                        'planing-style-f': ''
                    };
                    */
                    if (this.objectives !== '' || this.planingStyle !== '') {
                        text = reason[this.objectives];
                    }
                    return text;
                },
                saveSurvey: function () {
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
                            console.log('got data from user pref ', e);
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
                                //console.log('saved survey ', e);
                                //milestoneApp.getMilestonePlan();
                                location.reload();
                            });

                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('Could not fetch user_preferences: ', e);
                        }

                    });

                }
            },

            template: `
                <div id="planningsurvey" display="visibility: hidden;">
                    <div v-if="!surveyComplete" hidden class="row survey-btn">
                        <div class="col-sm-2 col-centered">
                            <div class="wrapper">
                                <div @click="showModal()" class="survey-starter survey-animate" data-toggle="modal" data-target="#theSurveyModal">
                                    <span>Lernen mit Plan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="theSurveyModal" class="xmodal" tabindex="-1" role="dialog">
                        <div v-if="modalSurveyVisible" class="xmodal-dialog xmodal-lg" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="MilestoneModalLabel">Vorbereitung Ihrer Semesterplanung für diesen Kurs</h5>
                                    <button @click="closeModal()" type="button" class="close" data-dismiss="modal"
                                        aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div class="form-check row">
                                        <p>Teilen Sie uns bitte hier Ihre Ziele mit, dann können wir Sie in der Semesterplanung besser unterstützen.
                                        </p>
                                        <label for="" class="col-12 col-form-label survey-objective-label">Welches Ziel verfolgen
                                            Sie in diesem Kurs/Modul?</label>
                                        <span :style="invalidObjective ? \'display:inline-block; border: solid 1px #ff420e;\' : \'\'">
                                            <div class="form-check">
                                                <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1"
                                                    value="f1a" v-model="objectives">
                                                <label class="form-check-label" for="exampleRadios1">
                                                    Die Prüfung erfolgreich absolvieren
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2"
                                                    value="f1b" v-model="objectives">
                                                <label class="form-check-label" for="exampleRadios2">
                                                    Orientierung im Themengebiet erlangen
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios3"
                                                    value="f1c" v-model="objectives">
                                                <label class="form-check-label" for="exampleRadios3">
                                                    Meinen eigenen Interessen bzgl. bestimmter Themengebiete nachgehen
                                                </label>
                                            </div>
                                            
                                            <div class="form-check">
                                                <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios4"
                                                    value="f1d" v-model="objectives">
                                                <label class="form-check-label" for="exampleRadios4">
                                                    keine Angaben
                                                </label>
                                            </div>
                                        </span>
                                        <div class="col-12 alert-invalid" role="alert" v-if="invalidObjective">Entscheiden Sie sich bitte für einer der Auswahlmöglichkeiten</div>
                                    </div>
                                    <hr>
                                    <div class="form-check row">
                                        <label for="inputMSname" class="col-10 col-form-label survey-objective-label">Wie viele Stunden pro Woche planen Sie für das Lernen in diesem Kurs / Modul ein?</label>
                                        <div class="col-2 ml-0 pl-0">
                                            <input :style="invalidAvailableTime ? \'border: solid 1px #ff420e;\' : \'\'" type="number" @change="updateAvailableTime()" class="form-control ml-0" id="inputMSname" placeholder="0" min="0"
                                                v-model="availableTime">
                                        </div>
                                        <div class="col-12 alert-invalid" role="alert" v-if="invalidAvailableTime">Geben Sie bitte eine Anzahl an Stunden, die größer Null ist.</div>
                                        <div class="col-12 w-50 alert-warning" role="warning">{{ isAvailableTimeSufficient() }}</div>
                                    </div>
                                    <hr>
                                    <div class="form-check row">
                                        <label for="" class="col-12 col-form-label survey-objective-label">
                                            Wie detailliert planen Sie Ihre Lernaktivitäten?<br/>Ich plane meist 
                                        </label>
                                        <span :style="invalidPlaningStyle ? \'display:inline-block; border: solid 1px #ff420e;\' : \'\'">
                                            <div class="form-check">
                                                <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios1"
                                                    value="planing-style-a" v-model="planingStyle">
                                                <label class="form-check-label" for="planingRadios1">
                                                    nur für eine Woche.
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios2"
                                                    value="planing-style-b" v-model="planingStyle">
                                                <label class="form-check-label" for="planingRadios2">
                                                    für die nächsten 4 Wochen.
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios3"
                                                    value="planing-style-c" v-model="planingStyle">
                                                <label class="form-check-label" for="planingRadios3">
                                                    für das ganze Semester mit Arbeitspaketen für je eine Woche.
                                                </label>
                                            </div>
                                                <div class="form-check">
                                                <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios4"
                                                    value="planing-style-d" v-model="planingStyle">
                                                <label class="form-check-label" for="planingRadios4">
                                                    für das ganze Semester mit Arbeitspaketen für je 2 Wochen. 
                                                </label>
                                            </div>
                                                <div class="form-check">
                                                <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios5"
                                                    value="planing-style-e" v-model="planingStyle">
                                                <label class="form-check-label" for="planingRadios5">
                                                    für das ganze Semester mit Arbeitspaketen für je einen Monat.
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios6"
                                                    value="planing-style-f" v-model="planingStyle">
                                                <label class="form-check-label" for="planingRadios6">
                                                    keine Angaben
                                                </label>
                                            </div>
                                        </span>
                                        <div class="col-12 alert-invalid" role="alert" v-if="invalidPlaningStyle">Verraten Sie uns bitte wie detailliert Sie Ihre Lernaktivitäten planen.</div>
                                    </div>
                                    <hr v-if="objectives === \'f1a\'">
                                    <div v-if="objectives === \'f1a\'" class="form-check row">
                                        <label for="inputObjectic" class="col-10 col-form-label survey-objective-label">Wann beabsichtigen Sie die Prüfung
                                            abzulegen?</label>
                                        <div class="col-4">
                                            <select @change="monthSelected" id="select_month">
                                                <!-- 
                                                :selected="selectedMonth === -1 ? (d.num-1 === (new Date()).getMonth()) : ((d.num-1)===selectedMonth)"
                                                -->
                                                <option v-for="d in monthRange()"
                                                    :value="d.num">{{ d.name }}</option>
                                            </select>

                                            <select @change="yearSelected" id="select_year">
                                                <!--
                                                :selected="selectedYear === -1 ? (d === (new Date()).getFullYear()) : d===selectedYear"
                                                -->
                                                <option v-for="d in yearRange(3)" >
                                                    {{ d }}
                                                </option>
                                            </select>
                                        </div>
                                        <div class="col-7"></div>
                                    </div>
                                    
                                    
                                    <br />
                                    <div class="row row-smooth">
                                        <div class="col-md">
                                            <div>
                                                <button @click="validateSurveyForm()" class="btn btn-primary btn-sm">{{ buttonText() }}</button>
                                                <button class="right btn btn-link right" @click="closeModal()" data-dismiss="modal"
                                                    aria-label="abbrechen">jetzt nicht</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
    };
    return survey;
});
