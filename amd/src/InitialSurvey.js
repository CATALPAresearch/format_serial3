/* eslint-disable space-before-function-paren */
/* eslint-disable spaced-comment */
/* eslint-disable capitalized-comments */

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
                        e = JSON.parse(e.response); console.log('got data from user pref ',e[0].value);
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
                        console.error('Could not fetch user_preferences: ', e);
                    }

                });
                //if (localStorage.surveyComplete) {
                    //localStorage.surveyComplete;
                    //console.log('local ',localStorage.surveyComplete)
                //}
            },
            watch: {
                surveyComplete: function (newStatus) {
                    //localStorage.surveyComplete = newStatus;
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
                            name: this.availableResources[i].section_name === ' ' ? '(Einführung)' : this.availableResources[i].section_name,
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
                            ms.objective = "Die Prüfung sehr gut bestehen";
                            if (this.selectedMonth !== today.getMonth() && this.selectedYear !== today.getFullYear()) {
                                ms.end = Date.parse('' + this.selectedYear + ',' + this.selectedMonth + ',1');
                            } else {
                                ms.end = Date.parse("2020,2,1"); // last month of the semester as default

                            }
                            //console.log("2020,2,1", new Date("2020, 2, 1"));
                            ms.resources = [];
                            ms.strategies = [];
                            milestoneApp.addMilestone(ms);

                            var biwiPlaningPruefung = [
                                {
                                    id: 1001,
                                    name: 'Willkommen im Modul 1D',
                                    objective: 'Orientierung im Modul 1D; Seminare belegen; Lernpartner finden; Lernen vorbereiten',
                                    start: '2019,9,1',
                                    end: '2019,9,6',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [{ "id": "gliederung", "name": "Gliederung", "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.", "url": "http://www.heise.de/", "category": "organization" }],
                                    reflections: [

                                    ]
                                },
                                {
                                    id: 1002,
                                    name: 'KE 33060 Bildung in der digitalisierten Gesellschaft (2SWS)',
                                    objective: 'Wissen aus der Kurseinheit erarbeiten und Wissen vertiefen',
                                    start: '2019,9,7',
                                    end: '2019,10,3',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [
                                        { id: 'mindmap', name: 'Mindmap', desc: 'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'exzerpte', name: 'Exzerpt', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'gliederung', name: 'Gliederung', desc: 'Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'strukturierung', name: 'Strukturierung von Wissen', desc: 'Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', url: "http://www.heise.de/", category: 'organization' },

                                        { id: 'transfer', name: 'Übertragung von neuem Wissen auf bekannte Schemata', desc: 'Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'examples', name: 'Beispiel aus dem Alltag/Arbeitsumfeld für neue Schemata', desc: 'Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'critical', name: 'kritisches Hinterfragen', desc: 'Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'structuring', name: 'Bezug zu anderen Fächern herstellen', desc: 'Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'pq4r', name: 'PQ4R-Methode', desc: 'Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung', url: "http://www.heise.de/", category: 'elaboration' },
                                    ],
                                    reflections: [

                                    ]
                                },
                                {
                                    id: 1003,
                                    name: 'KE 33061 Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft (2SWS)',
                                    objective: 'Wissen aus der Kurseinheit erarbeiten und Wissen vertiefen',
                                    start: '2019,10,4',
                                    end: '2019,11,1',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [
                                        { id: 'mindmap', name: 'Mindmap', desc: 'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'exzerpte', name: 'Exzerpt', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'gliederung', name: 'Gliederung', desc: 'Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'strukturierung', name: 'Strukturierung von Wissen', desc: 'Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', url: "http://www.heise.de/", category: 'organization' },

                                        { id: 'transfer', name: 'Übertragung von neuem Wissen auf bekannte Schemata', desc: 'Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'examples', name: 'Beispiel aus dem Alltag/Arbeitsumfeld für neue Schemata', desc: 'Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'critical', name: 'kritisches Hinterfragen', desc: 'Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'structuring', name: 'Bezug zu anderen Fächern herstellen', desc: 'Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'pq4r', name: 'PQ4R-Methode', desc: 'Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung', url: "http://www.heise.de/", category: 'elaboration' },
                                    ],
                                    reflections: [

                                    ]
                                },
                                {
                                    id: 1004,
                                    name: 'KE 33045 Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft (4SWS)',
                                    objective: 'Wissen aus der Kurseinheit erarbeiten und Wissen vertiefen',
                                    start: '2019,11,2',
                                    end: '2020,1,2',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [
                                        { id: 'mindmap', name: 'Mindmap', desc: 'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'exzerpte', name: 'Exzerpt', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'gliederung', name: 'Gliederung', desc: 'Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'strukturierung', name: 'Strukturierung von Wissen', desc: 'Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', url: "http://www.heise.de/", category: 'organization' },

                                        { id: 'transfer', name: 'Übertragung von neuem Wissen auf bekannte Schemata', desc: 'Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'examples', name: 'Beispiel aus dem Alltag/Arbeitsumfeld für neue Schemata', desc: 'Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'critical', name: 'kritisches Hinterfragen', desc: 'Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'structuring', name: 'Bezug zu anderen Fächern herstellen', desc: 'Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.', url: "http://www.heise.de/", category: 'elaboration' },
                                        { id: 'pq4r', name: 'PQ4R-Methode', desc: 'Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung', url: "http://www.heise.de/", category: 'elaboration' },
                                    ],
                                    reflections: [

                                    ]
                                },
                                {
                                    id: 1005,
                                    name: 'Prüfungsvorbereitung',
                                    objective: 'Inhalte wiederholen und Aufgaben für die Klausur üben',
                                    start: '2020,1,2',
                                    end: '2020,2,2',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [
                                        { id: 'exzerpte', name: 'Exzerpt', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "http://www.heise.de/", category: 'organization' },
                                        { id: 'flashcards', name: 'Systematisches Wiederholen mit der Lernkartei', desc: 'Mit Lernkarten kann man Dinge systematisch wiederholen bis alles für die Prüfung sitzt. ', url: "http://www.heise.de/", category: 'repeatition' },
                                        { id: 'repeatition', name: 'Repetieren', desc: 'Mit vielen Wiederholungen festigt sich das Wissen. ', url: "http://www.heise.de/", category: 'repeatition' },
                                        { id: 'assoc', name: 'Eselsbrücken als Erinnerungshilfe', desc: 'Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.', url: "http://www.heise.de/", category: 'repeatition' },
                                        { id: 'loci', name: 'Loci Methode', desc: 'Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.', url: "http://www.heise.de/", category: 'repeatition' }

                                    ],
                                    reflections: [

                                    ]
                                },
                                {
                                    id: 1006,
                                    name: 'Klausur Modul 1D am 02.März .2020, 14-18 Uhr in xxxx',
                                    objective: 'Klausur bestehen',
                                    start: '2020,2,2',
                                    end: '2020,2,2',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [
                                        { id: 'assoc', name: 'Eselsbrücken als Erinnerungshilfe', desc: 'Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.', url: "http://www.heise.de/", category: 'repeatition' },
                                        { id: 'loci', name: 'Loci Methode', desc: 'Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.', url: "http://www.heise.de/", category: 'repeatition' }
                                    ],
                                    reflections: [

                                    ]
                                }
                            ];

                            //milestones.push(ms);
                            //milestoneApp.milestones.push(ms);
                            break;
                        case 'f1b': // wants orientation
                            var biwiPlaningOrientation = [
                                {
                                    id: 1001,
                                    name: 'Willkommen im Modul 1D',
                                    objective: 'Orientierung im Modul 1D; Seminare belegen; Lernpartner finden; Lernen vorbereiten',
                                    start: '2019,9,1',
                                    end: '2019,9,6',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [{ "id": "gliederung", "name": "Gliederung", "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.", "url": "http://www.heise.de/", "category": "organization" }],
                                    reflections: [

                                    ]
                                },
                                {
                                    id: 1002,
                                    name: 'Willkommen im Modul 1D',
                                    objective: 'Orientierung im Modul 1D; Seminare belegen; Lernpartner finden; Lernen vorbereiten',
                                    start: '2019,9,1',
                                    end: '2019,9,6',
                                    status: 'progress', // progress, ready, urgent, missed, reflected
                                    progress: 0.0,
                                    resources: [],
                                    strategies: [{ "id": "gliederung", "name": "Gliederung", "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.", "url": "http://www.heise.de/", "category": "organization" }],
                                    reflections: [

                                    ]
                                }
                            ];
                            break;
                        case 'f1c': // wants certain topics
                            break;
                        case 'f1d': // doesn't want anything
                            break;
                    }

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
                            console.log('got data from user pref ', e);
                            milestoneApp.surveyDone = 1;
                            this.surveyComplete = true;
                            $('#theSurveyModal').modal('hide');
                            $('#planing-component').show();
                        } catch (e) {
                            console.error('Could not fetch user_preferences: ', e);
                        }

                    });
                    
                }
            }
        });
    };
    return survey;
});
