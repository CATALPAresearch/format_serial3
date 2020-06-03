/* eslint-disable no-labels */
/* eslint-disable camelcase */
/* eslint-disable no-unused-labels */
/* eslint-disable no-loop-func */
/* eslint-disable max-depth */
/* eslint-disable space-before-function-paren */
/* eslint-disable valid-jsdoc */
/* eslint-disable capitalized-comments */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/**
 * Timeline
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      Timeline
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define([
    'jquery',
    'core/ajax',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/MilestoneCalendarExport.js"
], function ($, ajax, Vue, MilestoneCalendarExport) {

    var Timeline = function (d3, dc, crossfilter, moment, utils, introJs, logger, FilterChart, ActivityChart, InitialSurvey, vDP, vDPde, ErrorHandler) {

        $(document).ready(function () {
            let edit = $("a.milestone-element-edit");
            let filler = $("span.ms-edit-filler");
            filler.innerWidth(edit.innerWidth());
            filler.css('display', 'inline-block');
        });

        var width = document.getElementById('ladtopic-container-0').offsetWidth;
        var margins = { top: 15, right: 10, bottom: 20, left: 10 };
        var course = {
            courseType: 'Kurs', // or 'Modul'
            semesterShortName: 'SoSe 2020',
            id: parseInt($('#courseid').text(), 10),
            // module: parseInt($('#moduleid').html())
            startDate: new Date(2020, 3, 1, 0, 0, 0),
            endDate: new Date(2020, 8, 30, 23, 59, 59),
            start: (new Date(2020, 3, 1, 0, 0, 0)).getTime() / 1000,
            end: (new Date(2020, 8, 30, 23, 59, 59)).getTime() / 1000,
            minimumWeeklyWorkload: 6,
            maximumWeeklyWorkload: 30,
            maxPlaningPeriod: 12 // months
        };

        utils.get_ws('logstore', {
            'courseid': parseInt(course.id, 10)
        }, function (e) {
            try {
                draw(JSON.parse(e.data), logger);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        });

        /**
         * 
         * @param {*} activityData (Object)
         * @param {*} logger (Object)
         */
        var draw = function (activityData, logger) {

            var xRange = [
                course.startDate,
                course.endDate
            ];
            /*
            http://computationallyendowed.com/blog/2013/01/21/bounded-panning-in-d3.html
            var zoom = d3.behavior.zoom().scaleExtent([1, 1]);
            zoom.on('zoom', function() {
                var t = zoom.translate(),
                    tx = t[0],
                    ty = t[1];

                tx = Math.min(tx, 0);
                tx = Math.max(tx, width - max);
                zoom.translate([tx, ty]);

                // chart.chartBodyG();
                svg.select('.chart-body').attr('d', line);
            }); */

            /* var modal = Vue.component('modal', {
                 template: '#modalMilestone',
                 props: ['data'],
                 data: function() {
                     return {
                         
                     };
                 }
             });*/


            var milestoneApp = new Vue({
                el: '#planing-component',
                components: {
                    'datepicker': vDP,
                    'milestone-calendar-export': MilestoneCalendarExport
                    // 'survey': surveyForm
                },
                data: function () {
                    return {
                        // <s> datepicker
                        startDate: new Date(),
                        endDate: new Date(),
                        semesterRange: null,
                        dpRange: null,
                        daysOffset: 20,
                        DPde: vDPde,
                        // <e> datepicker
                        surveyDone: 0,
                        chart: '',
                        timeFilterChart: '',
                        xAxis: '',
                        yAxis: '',
                        x_axis_call: '',
                        y_axis_call: '',
                        colors: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
                        bars: '',
                        barwidth: 80,
                        barheight: 21,
                        bardist: 3,
                        maxLanes: 3,
                        width: 730,
                        height: 70,
                        margins: {},
                        padding: 100,
                        xmin: 0,
                        xmax: 0,
                        ymin: 0,
                        ymax: 3,
                        done: [],
                        range: [],
                        milestones: [],
                        calendar: {},
                        emptyMilestone: {
                            id: 10,
                            name: '',
                            objective: '',
                            start: '',
                            end: '',
                            status: 'progress', // progress, ready, urgent, missed, reflected
                            progress: 0.0,
                            resources: [],
                            strategies: [],
                            reflections: [],
                            yLane: 0,
                            mod: false
                        },
                        invalidName: false,
                        invalidObjective: false,
                        invalidResources: false,
                        invalidStrategy: false,
                        invalidEndDate: false,
                        invalidStartDate: false,
                        invalidReflections: [],
                        selectedDay: 1,
                        selectedMonth: 1,
                        selectedYear: course.startDate.getFullYear(),
                        invalidDay: false,
                        selectedStartDay: 1,
                        selectedStartMonth: 1,
                        selectedStartYear: course.startDate.getFullYear(),
                        invalidEndDay: false,
                        invalidStartDay: false,
                        filterPreset: '',
                        selectedMilestone: 0,
                        modalVisible: false,
                        modalReflectionVisible: false,
                        reflectionsFormVisisble: false,
                        modUsers: [],
                        modStatistics: {
                            users: 0,
                            surveys: 0,
                            milestones: 0,
                            msProgessed: 0,
                            msReady: 0,
                            msUrgent: 0,
                            msMissed: 0,
                            msReflected: 0,
                            ptExam: 0,
                            ptOrientation: 0,
                            ptInterest: 0,
                            ptNoAnswer: 0,
                            ptW1: 0,
                            ptW4: 0,
                            ptWA: 0,
                            ptWA2: 0,
                            ptWA4: 0,
                            ptWANA: 0
                        },
                        strategyCategories: [
                            { id: 'organization', name: 'Organisation' },
                            { id: 'elaboration', name: 'Elaborationsstrategien' },
                            { id: 'repeatition', name: 'Wiederholungsstrategien' },
                            { id: 'misc', name: 'Sonstige' }

                        ],
                        strategies: [ // Übertrage Ansätze auf Kontexte ?? #86
                            { id: 'reading', name: 'Überblick durch Lesen/Querlesen', desc: '<div>Durch schnelles Querlesen verschaffen Sie sich einen Überblick über das Themengebiet. Schauen Sie sich doch auch einmal die PQ4R-Methode an. <a href="https://www.example.com/">Details</a></div>', url: "", category: 'organization' },
                            { id: 'mindmap', name: 'Erzeuge Mindmap', desc: 'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "", category: 'organization' },
                            { id: 'exzerpte', name: 'Fertige Exzerpt an', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "", category: 'organization' },
                            { id: 'gliederung', name: 'Erstelle Gliederung', desc: 'Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.', url: "", category: 'organization' },
                            { id: 'strukturierung', name: 'Strukturiere Wissen', desc: 'Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', url: "", category: 'organization' },
                            { id: 'makeflashcards', name: 'Lernkarten erstellen', desc: 'Lernkarten kann man sehr früh digital z.B. in einer App oder auf Papier erstellen. Das erleichtert die Prüfungsvorbereitung.', url: "", category: 'organization' },


                            { id: 'transfer', name: 'Wende neues Wissen an', desc: 'Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.', url: "", category: 'elaboration' },
                            { id: 'examples', name: 'Übertrage Ansätze auf Berufliches', desc: 'Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.', url: "", category: 'elaboration' },
                            { id: 'critical', name: 'Hinterfrage Inhalte kritisch', desc: 'Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.', url: "", category: 'elaboration' },
                            { id: 'structuring', name: 'Stelle Bezug zu anderen Fächern her', desc: 'Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.', url: "", category: 'elaboration' },
                            { id: 'pq4r', name: 'Wende PQ4R - Methode an', desc: 'Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung', url: "", category: 'elaboration' },


                            { id: 'flashcards', name: 'Auswendiglernen mit Lernkarten', desc: 'Mit Lernkarten kann man Dinge systematisch wiederholen bis alles für die Prüfung sitzt. ', url: "", category: 'repeatition' },
                            { id: 'repeatition', name: 'Repetieren', desc: 'Mit vielen Wiederholungen festigt sich das Wissen. ', url: "", category: 'repeatition' },
                            { id: 'assoc', name: 'Eselsbrücken', desc: 'Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.', url: "", category: 'repeatition' },
                            { id: 'loci', name: 'Loci Methode', desc: 'Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.', url: "", category: 'repeatition' }

                        ],
                        resources: []
                    };
                },
                mounted: function () {
                    moment.locale('de');
                    var _this = this;
                    this.range = xRange;
                    // load milestone data from database via webservice
                    utils.get_ws('getmilestones', {
                        data: {
                            'courseid': parseInt(course.id, 10)
                        }
                    }, function (e) {
                        _this.emptyMilestone.end = new Date();
                        _this.emptyMilestone.start = new Date();
                        _this.initializeChart();
                        try {
                            if (e !== null) {
                                var data = JSON.parse(e.milestones);
                                if (!data || !data.milestones) {
                                    _this.milestones = [];
                                } else {
                                    // todo: A validation of the JSON should be feasible
                                    _this.milestones = JSON.parse(data.milestones);
                                    _this.updateMilestoneStatus();

                                    var facts = crossfilter(activityData);
                                    _this.timeFilterChart = new FilterChart(d3, dc, crossfilter, facts, xRange, _this, utils, logger, course);

                                    _this.setFilterPreset('last-month');
                                    var activityChart = new ActivityChart(d3, dc, crossfilter, moment, activityData, utils, course);
                                    xRange = activityChart.getXRange();
                                    _this.timeFilterChart.registerChart(activityChart);

                                    logger.add('planing_tool_open', { pageLoaded: true });
                                }
                            }
                        } catch (error) {
                            _this.milestones = [];
                        }

                    });

                    this.getMilestonePlan();

                    /* window.addEventListener('keyup', function(event) {
                        if (event.keyCode === 27 && this.modalVisible) {
                            _this.closeModal();
                        }
                    });*/

                    // Load Events from the calendar                                                    
                    utils.get_ws('getcalendar', {
                        'courseid': parseInt(course.id, 10)
                    }, function (e) {
                        try {
                            if (typeof e.data === "string" && e.data.length > 0) {
                                _this.calendar = JSON.parse(e.data);
                            }
                        } catch (error) {
                            new ErrorHandler(error);
                        }
                    });

                    $(document).ready(function () {
                        if ($('#reportModal').length > 0) {
                            $('#reportModal').on('shown.bs.modal', function () {
                                _this.modGetStatisticData(_this);
                            });
                        }
                    });

                },
                created: function () {
                    var _this = this;
                    $(document).keyup(function (e) {
                        e.preventDefault();
                        if (e.key === "Escape") { // escape key maps to keycode `27`
                            //_this.closeModal();
                            _this.updateMilestoneStatus();
                            _this.updateChart(_this.range);
                        }
                    });
                    $('#additionalCharts').hide();
                    $('#filter-presets').hide();
                    // initialize the semester range and the datepicker range
                    
                    this.dpRange = {
                        to: course.startDate,
                        from: moment(course.endDate).add(course.maxPlaningPeriod, 'months').toDate()//new Date(end.setDate(end.getDate() + 1 + this.daysOffset)) // had to create new date otherwise it will throw a parse error 
                    };
                },
                watch: {
                    milestones: function (newMilestone) {
                        //console.log('watch ms called')
                        //this.updateMilestones();
                    },
                    surveyDone: function (surveyStatus) {
                        if (this.surveyDone > 0) {
                            $('.activity-chart-container').show();
                            $('.filter-chart-container').show();
                        }
                    }
                },
                computed: {
                    archivedMilestones: function () {
                        return this.milestones.filter(
                            function (f) {
                                return f.status === "missed" || f.status === "reflected";
                            }
                        );
                    },
                    remainingMilestones: function () {
                        return this.milestones.filter(
                            function (f) {
                                return f.status !== "missed" && f.status !== "reflected";
                            }
                        );
                    },
                    dayOfSelectedMilestone: {
                        get: function () {
                            return this.getSelectedMilestone().end.getDate();
                        },
                        set: function (d) {

                        }
                    },
                    monthOfSelectedMilestone: {
                        get: function () {
                            return this.getSelectedMilestone().end.getMonth() + 1;
                        },
                        set: function (d) {

                        }
                    },
                    yearOfSelectedMilestone: {
                        get: function () {
                            return this.getSelectedMilestone().end.getFullYear();
                        },
                        set: function (d) {

                        }
                    },
                    startDayOfSelectedMilestone: {
                        get: function () {
                            return this.getSelectedMilestone().start.getDate();
                        },
                        set: function (d) {

                        }
                    },
                    startMonthOfSelectedMilestone: {
                        get: function () {
                            return this.getSelectedMilestone().start.getMonth() + 1;
                        },
                        set: function (d) {

                        }
                    },
                    startYearOfSelectedMilestone: {
                        get: function () {
                            return this.getSelectedMilestone().start.getFullYear();
                        },
                        set: function (d) {

                        }
                    }
                },
                methods: {
                    getSemesterShortName: function () {
                        return course.semesterShortName;
                    },
                    startIntroJs: function () {
                        introJs()
                            .setOptions({
                                showProgress: true,
                                nextLabel: 'weiter',
                                prevLabel: 'zurück',
                                skipLabel: 'abbrechen',
                                hidePrev: true,
                                hideNext: true,
                                doneLabel: 'fertig',
                                exitOnEsc: true,
                                exitOnOverlayClick: true,
                                showStepNumbers: true,
                                keyboardNavigation: true,
                                scrollToElement: true,
                                steps: [
                                    {
                                        element: document.querySelector('#planing-component'),
                                        intro: '<p>Im Fernstudium sind Sie besonders gefordert, sich selbst zu organisieren und das Lernpensum gut einzuteilen. Wir wissen, dass viele von Ihnen berufstätig sind oder das Fernstudium gewählt haben, da sie die damit verbundene Flexibilität schätzen und brauchen. Dies stellt Sie gleichsam aber auch vor die Herausforderung, Ihr Semester eigenständig zu planen, sich selbst zu disziplinieren und die Übersicht zu behalten. Die Formulierung von Meilensteinen als Teilschritte auf dem Weg zu Ihrem persönlichen Ziel oder zur Prüfung helfen dabei, das Volumen eines Semesters übersichtlich zu machen, es zu strukturieren, zu organisieren und das Ziel im Auge zu behalten. Man darf dann auch auf jeden erreichten Meilenstein ein wenig stolz sein und sich selbst belohnen.</p>',
                                        position: 'top',
                                        step: 1
                                    },
                                    {
                                        element: document.querySelector('#add-milestone'),
                                        intro: 'Für Ihre Semesterplanung können Sie Meilensteine auch selbst hinzufügen.',
                                        position: 'top',
                                        step: 2
                                    },
                                    {
                                        element: document.querySelector('#milestone-list-tab'),
                                        intro: 'Hier können Sie die Meilensteine als Liste sehen.',
                                        position: 'top',
                                        step: 3
                                    },
                                    {
                                        element: document.querySelector('.milestone-element-name'),
                                        intro: 'In der ersten Spalte ist der Name der Meilensteine zu sehen.',
                                        position: 'top',
                                        step: 4
                                    },
                                    {
                                        element: document.querySelector('.milestone-element-due'),
                                        intro: 'Hier sehen Sie, wie viel Zeit Ihnen bis zum Abschluss des Meilensteins bleibt.',
                                        position: 'top',
                                        step: 5
                                    },
                                    {
                                        element: document.querySelector('.milestone-element-edit'),
                                        intro: 'Durch einen Klick auf "bearbeiten" in der Listenansicht kann man in den Bearbeitungsmodus wechseln.',
                                        position: 'top',
                                        step: 6
                                    },
                                    /* Open modal window for editing milestones
                                    {
                                        element: document.querySelector('#theMilestoneModal'),
                                        intro: 'Effektiv Lernende setzen sich Teilziele in ihrem Lernprozess, wir nennen sie Meilensteine. Je nach Erfahrung und Vorlieben können Meilensteine große Aufgabenketten beschreiben oder kleine geschlossene Arbeitspakete darstellen. Eines ist jedoch allen gemein: sie verfolgen ein konkretes Ziel. Im Fernstudium ist das in der Regel ein Lernziel, wie z.B. einen bestimmten Wissensstand zu erreichen oder eine Fertigkeit, die in einer bestimmten Qualität beherrscht werden soll. <br> Um einen Meilensteinen zu gestalten, ist neben dem Lernziel der Zeitraum, die Themen, Materialien und Aktivitäten und eine passende Lernstrategie zu wählen.',
                                        position: 'bottom',
                                        step: 7
                                    },
                                    {
                                        element: document.querySelector('#strategy-introduction'),
                                        intro: 'Lernstrategien können den Lernprozess positiv beeinflussen. Studien haben gezeigt, dass Lernende, die ein gewisses Repertoire an Lernstrategien gut nutzen, auch bei knappen zeitlichen Ressourcen und hohem Stress in der Lage sind, bessere Leistungen zu erbringen. Lernen ist also nicht nur abhängig von der Zeit, die man zur Verfügung hat, sondern auch davon, wie diese genutzt wird. Dabei bewähren sich manche Lernstrategien durch Automation, manche jedoch auch, indem sie im Zusammenspiel mit bestimmten Herausforderungen besser funktionieren. <br> Unser Tipp: Lernen Sie sich und Ihre Lernstrategien besser kennen und probieren Sie gerne auch einmal etwas Neues aus.Beim Klick auf das „?“ wird kurz erklärt, worum es geht.',
                                        position: 'left',
                                        step: 8
                                    },
                                     */
                                    /* Return to milestone list */
                                    {
                                        element: document.querySelector('.milestone-element-progress'),
                                        intro: 'Der grüne Balken drückt aus, wie weit die Bearbeitung schon fortgeschritten ist.',
                                        //Sind alle Materialien abgearbeitet werden sie abgehakt, die Lernstrategien müssen durch abhaken bestätigt werden oder können gelöscht werden, wenn sie nicht genutzt wurden. Ist der Meilenstein erledigt, dann ist es Zeit für die Reflexion. Sie hilft Ihnen zu überlegen, was gut geklappt hat und was Sie ggf. besser machen könnten. Mit der Beantwortung der letzten Frage können Sie einen persönlichen Lernhinweis festhalten, damit Sie die nächste Lernsession noch besser gestalten. Das gilt ganz besonders dann, wenn es einmal mit der Zielerreichung nicht so ganz geklappt hat. Wir lernen auch durch Fehler.',
                                        position: 'bottom',
                                        step: 7
                                    },
                                    /* Milestone timeline chart */
                                    {
                                        element: document.querySelector('#milestone-timeline-tab'),
                                        intro: 'Sie können sich die Meilensteine auch als Zeitleiste anzeigen lassen.',
                                        position: 'top',
                                        step: 8
                                    },
                                    {
                                        element: document.querySelector('.milestone-chart-container'),
                                        intro: 'In der oberen Zeitleiste werden Meilensteine dargestellt.',
                                        position: 'top',
                                        step: 9
                                    },
                                    {
                                        element: document.querySelector('.activity-chart-container'),
                                        intro: 'Im mittleren Teil sehen Sie, in welchen Bereichen Sie im Kurs bereits aktiv waren. Auf der X-Achse ist die Zeit abgebildet. Die Größe der Punkte zeigt Ihnen an, wie aktiv Sie waren.',
                                        position: 'top',
                                        step: 10
                                    },
                                    {
                                        element: document.querySelector('.filter-chart-container'),
                                        intro: 'Diese Zeitleiste umfasst das gesamte Semester und ermöglicht Ihnen, den Betrachtungszeitraum der oberen Zeitleisten durch die äußeren Schieber auf Stunden, Tage oder Wochen zu begrenzen.',
                                        position: 'top',
                                        step: 11
                                    },
                                    {
                                        element: document.querySelector('.time-filters'),
                                        intro: 'Hier können Sie auch noch weitere Filter nutzen.',
                                        position: 'top',
                                        step: 12
                                    }
                                ]
                            })
                            .onbeforechange(function (targetElement) {
                                switch (targetElement.id) {
                                    case "milestone-timeline-tab":
                                        targetElement.click();
                                        break;
                                    case "milestone-list-tab":
                                        targetElement.click();
                                        break;
                                    case "theMilestoneModal":
                                        document.querySelector('.milestone-element-edit').click();
                                        break;
                                }
                            })
                            .onafterchange(function (targetElement) {
                                console.log(targetElement.id)
                                if (targetElement.id === "strategy-introduction") {
                                    document.querySelector('#close-modal').click();
                                }
                            })
                            .start();
                    },
                    showAdditionalCharts: function () {
                        $('#additionalCharts').show();
                        $('#filter-presets').show();
                        logger.add('milestone_view_switch', { selectedView: 'timeline' });
                    },
                    hideAdditionalCharts: function () {
                        $('#additionalCharts').hide();
                        $('#filter-presets').hide();
                        logger.add('milestone_view_switch', { selectedView: 'list' });
                    },
                    getMoodlePath: function () {
                        return M.cfg.wwwroot;
                    },
                    initializeChart: function () {
                        var _this = this;
                        this.range = xRange;
                        this.selectedDay = 1; // (new Date()).getDate();
                        this.selectedMonth = 1; // (new Date()).getMonth() + 1;
                        this.selectedYear = (new Date()).getFullYear();
                        // obtain course structure form DB
                        var t1 = new Date().getTime();
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
                                let data = JSON.parse(e.data);
                                // Sort Ressources
                                let obj = new Array(data.length);
                                for (let i in data) {
                                    let pos = 0;
                                    for (let x in data) {
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
                                _this.resources = obj;
                                for (let i in _this.calendar) {
                                    let element = _this.calendar[i];
                                    if (element.eventtype !== "course" && element.eventtype !== "group") continue;
                                    let date = moment.unix(+element.timestart).format("DD.MM.YYYY");
                                    let out = {
                                        course_id: course.id,
                                        id: element.id,
                                        instance_id: null,
                                        instance_title: null,
                                        instance_type: element.eventtype === "course" ? "kurstermin" : "gruppentermin",
                                        instance_url_id: null,
                                        module_id: null,
                                        name: element.name + " [" + date + "]",
                                        pos_module: null,
                                        pos_section: null,
                                        section: null,
                                        section_id: 999,
                                        section_name: null
                                    }
                                    _this.resources.push(out);
                                }
                                _this.createMilestonePicker();
                                //console.log('Ladezeit', t1 - (new Date()).getTime());
                                //console.log('course-structure-result', _this.resources.map(function(e) { return e.id; }));
                                //console.log('debug', JSON.parse(e.debug));
                            } catch (e) {
                                // eslint-disable-next-line no-console
                                console.error(e);
                            }
                        });
                        this.margins = margins;
                        this.width = width;
                        if (this.milestones === null || this.milestones === undefined) {
                            return;
                        }
                        this.milestones.forEach(function (d, i) {
                            d.start = new Date(d.start);
                            d.end = new Date(d.end);
                            d.g = 1;
                        });
                        this.updateLanes();
                        this.xmin = d3.min(this.milestones, function (d) {
                            return d.start;
                        });
                        this.xmax = d3.max(this.milestones, function (d) {
                            return d.end;
                        });
                        this.ymax = 3;// this.milestones.length;

                        var x = d3.scaleTime()
                            .domain(this.range) // .x(d3.scaleTime().domain(xRange) // [this.xmin, this.xmax]
                            .range([0, this.width - this.padding]); // 
                        var y = d3.scaleLinear()
                            .domain([0, this.ymax])
                            .range([0, this.height]);
                        var z = d3.scaleOrdinal()
                            .range(this.colors);

                        this.xAxis = d3.axisTop().scale(x).ticks(10).tickFormat(utils.multiFormat);
                        this.yAxis = d3.axisLeft().scale(y).ticks(0);

                        // Adds the svg canvas
                        this.chart = d3.select('.chart.ms-chart .milestone-chart-container svg g');

                        // Add the Axis
                        this.x_axis_call = this.chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").call(this.xAxis);
                        this.y_axis_call = this.chart.append("g").attr("class", "y axis").call(this.yAxis);
                        //this.x = x;
                        //this.y = y;
                        this.updateChart(this.range);

                    },
                    getMilestones: function () {
                        return this.milestones;
                    },
                    getMilestonesById: function (id) {
                        return this.milestone.filter(function (m) {
                            return m.id === id ? true : false;
                        });
                    },
                    xx: function (x) {
                        x = new Date(x);
                        var xpos = d3.scaleTime().domain(this.range).range([0, this.width - this.padding])(x);
                        /* 
                        if(typeof(xpos) !== 'Number'){
                            var timeFormat = d3.timeParse("%Y-%m-%dT%H:%M:%SZ"); // 2020-05-20T19:10:45.416Z
                            x = new Date(x);
                            xpos = d3.scaleTime().domain(this.range).range([0, this.width - this.padding])(x);
                        }
                        */
                        return xpos;

                    },
                    duration: function (start, end) {
                        start = new Date(start);
                        end = new Date(end);
                        var x_start = d3.scaleTime().domain(this.range).range([0, this.width - this.padding])(start);
                        var x_end = d3.scaleTime().domain(this.range).range([0, this.width - this.padding])(end);

                        /*if (typeof (x_start) !== 'Number') {
                            start = new Date(start);
                            end = new Date(end);
                            x_start = d3.scaleTime().domain(this.range).range([0, this.width - this.padding])(start);
                            x_end = d3.scaleTime().domain(this.range).range([0, this.width - this.padding])(end);
                        }*/
                        var duration = x_end - x_start;
                        return duration < 10 ? 10 : duration;
                    },
                    z: function () {
                        return d3.scaleOrdinal()
                            .range(this.colors);
                    },
                    getYLane: function (id) {
                        return this.milestones.filter(function (m) {
                            return m.id === id ? true : false;
                        })[0].yLane;
                    },
                    updateChart: function (range) {
                        this.updateLanes();

                        this.range = range;
                        //var z = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                        this.x_axis_call.transition().duration(500).call(this.xAxis.scale(d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding])).ticks(10).tickFormat(utils.multiFormat));
                        //this.y_axis_call.transition().duration(0).call(this.yAxis.scale(this.y));
                        this.y_axis_call.transition().duration(0).call(this.yAxis.scale(d3.scaleLinear()
                            .domain([0, this.ymax])
                            .range([0, this.height])));

                        this.$forceUpdate();
                    },
                    updateLanes: function () {
                        // Recognize interval overlaps for the milestone start/end time
                        var lanes = [[], [], [], [], []];

                        for (var i = 0; i < this.milestones.length; i++) {
                            lanesLoop:
                            for (var lane = 0; lane < lanes.length; lane++) {
                                if (lanes[lane].length === 0) {
                                    lanes[lane].push(this.milestones[i]);
                                    this.milestones[i].yLane = lane;
                                    break lanesLoop;
                                }
                                var sufficientSpace = true;
                                for (var j = 0; j < lanes[lane].length; j++) {
                                    if (moment(this.milestones[i].end).diff(moment(lanes[lane][j].start)) < 0) {
                                        // ms liegt davor
                                    } else if (moment(this.milestones[i].start).diff(moment(lanes[lane][j].end)) > 0) {
                                        // ms liegt dahinter
                                    } else {
                                        sufficientSpace = false;
                                        //break lanesLoop;
                                    }
                                }
                                if (sufficientSpace) {
                                    lanes[lane].push(this.milestones[i]);
                                    this.milestones[i].yLane = lane;
                                    break lanesLoop;
                                }
                            }
                        }
                        // number of rows
                        this.maxLanes = lanes.filter(function (l) {
                            return l.length > 0 ? true : false;
                        }).length;

                        this.height = this.maxLanes * 24;
                    },
                    showModal: function (milestoneID) {
                        this.selectedMilestone = milestoneID;
                        this.startDate = this.getSelectedMilestone().start;
                        this.endDate = this.getSelectedMilestone().end;
                        this.reflectionsFormVisisble = this.getSelectedMilestone().status === 'reflected' ? true : false;
                        this.modalVisible = true;
                        this.getSelectedMilestone().mod = false;
                        if (milestoneID > 0) {
                            logger.add('milestone_edit_dialog_open', {
                                milestoneId: this.getSelectedMilestone().id,
                                name: this.getSelectedMilestone().name,
                                start: new Date(this.getSelectedMilestone().start).getTime(),
                                end: new Date(this.getSelectedMilestone().end).getTime(),
                                status: this.getSelectedMilestone().status,
                                objective: this.getSelectedMilestone().objective,
                                resources: this.getSelectedMilestone().resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                                strategies: this.getSelectedMilestone().strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                            });
                        }
                    },
                    closeModal: function (update = true) {
                        this.modalVisible = false;
                        if (update === false) return;
                        this.updateMilestoneStatus();
                        this.updateChart(this.range);
                        logger.add('milestone_dialog_close', { dialogOpen: false });
                    },
                    showReflectionModal: function (e) {
                        this.selectedMilestone = e;
                        this.reflectionsFormVisisble = this.getSelectedMilestone().status === 'reflected' ? true : false;
                        this.modalReflectionVisible = true;
                        logger.add('milestone_reflection_dialog_open', {
                            milestoneId: this.getSelectedMilestone().id,
                            name: this.getSelectedMilestone().name,
                            start: new Date(this.getSelectedMilestone().start).getTime(),
                            end: new Date(this.getSelectedMilestone().end).getTime(),
                            status: this.getSelectedMilestone().status,
                            objective: this.getSelectedMilestone().objective,
                            resources: this.getSelectedMilestone().resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                            strategies: this.getSelectedMilestone().strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                        });

                    },
                    closeReflectionModal: function (e) {
                        this.modalReflectionVisible = false;
                        this.updateMilestoneStatus();
                        logger.add('reflection_dialog_close', { dialogOpen: false });
                    },
                    getSelectedMilestone: function () {
                        if (this.selectedMilestone === -1) {
                            return this.emptyMilestone;
                        }
                        var _this = this;
                        return this.milestones.filter(function (d) {
                            return d.id === _this.selectedMilestone;
                        })[0];
                    },
                    showEmptyMilestone: function (e) {
                        this.selectedMilestone = -1;
                        var t = new Date();
                        this.startDate = t;
                        this.endDate = t;
                        this.modalVisible = true;
                        logger.add('milestone_dialog_open_new', { dialogOpen: true });
                    },
                    updateName: function (e) {
                        this.invalidName = this.getSelectedMilestone().name === '' ? true : false;
                    },
                    updateObjective: function (e) {
                        this.invalidObjective = this.getSelectedMilestone().objective === '' ? true : false;
                    },
                    validateMilestoneForm: function () {
                        var isValid = true;
                        if (this.getSelectedMilestone().name.length === 0) {
                            this.invalidName = true;
                            isValid = false;
                        }
                        if (this.getSelectedMilestone().objective.length === 0) {
                            this.invalidObjective = true;
                            isValid = false;
                        }
                        if (this.getSelectedMilestone().resources.length === 0 && this.resources.length > 0) {
                            this.invalidResources = true;
                            isValid = false;
                        }
                        if (this.getSelectedMilestone().strategies.length === 0) {
                            this.invalidStrategy = true;
                            isValid = false;
                        }
                        if (isValid) {
                            if (this.selectedMilestone === -1) {
                                let id = this.createMilestone();
                                Vue.nextTick().then(
                                    (resolve) => {
                                        if ($("#milestone-list-tab").hasClass("active") || $("#milestone-archive-list-tab").hasClass("active")) {
                                            let milestone;
                                            this.milestones.forEach(
                                                function (element) {
                                                    if (element.id === id) milestone = element;
                                                    return;
                                                }
                                            );
                                            if (typeof milestone === "object") {
                                                if (milestone.status === "missed" || milestone.status === "reflected") {
                                                    this.moveToMilestoneArchiveListEntry(id, true);
                                                } else {
                                                    this.moveToMilestoneListEntry(id, true);
                                                }
                                            }
                                        } else if ($("#milestone-timeline-tab").hasClass("active")) {
                                            this.moveToMilestoneTimelineEntry(id, 3);
                                        }
                                    }
                                );
                            } else {
                                $('#theMilestoneModal').modal('hide');
                                this.updateMilestoneStatus();
                                logger.add('milestone_updated', {
                                    milestoneId: this.getSelectedMilestone().id,
                                    name: this.getSelectedMilestone().name,
                                    start: new Date(this.getSelectedMilestone().start).getTime(),
                                    end: new Date(this.getSelectedMilestone().end).getTime(),
                                    status: this.getSelectedMilestone().status,
                                    objective: this.getSelectedMilestone().objective,
                                    resources: this.getSelectedMilestone().resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                                    strategies: this.getSelectedMilestone().strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                                });
                                if ($("#milestone-list-tab").hasClass("active") || $("#milestone-archive-list-tab").hasClass("active")) {
                                    if (this.getSelectedMilestone().status === "missed" || this.getSelectedMilestone().status === "reflected") {

                                        this.moveToMilestoneArchiveListEntry(this.getSelectedMilestone().id, true);
                                    } else {

                                        this.moveToMilestoneListEntry(this.getSelectedMilestone().id, true);
                                    }
                                } else if ($("#milestone-timeline-tab").hasClass("active")) {
                                    this.moveToMilestoneTimelineEntry(this.getSelectedMilestone().id, 3);
                                }
                            }
                        }
                    },
                    createMilestone: function (e) {
                        this.emptyMilestone.id = Math.ceil(Math.random() * 100000);
                        let id = this.emptyMilestone.id;

                        // Change hourse, minutes and seconds of the begin and end of an milestone.
                        this.emptyMilestone.start.setHours(0,0,0); 
                        this.emptyMilestone.end.setHours(23,59,59);
                        
                        this.milestones.push(this.emptyMilestone);

                        logger.add('milestone_created', {
                            milestoneId: this.emptyMilestone.id,
                            name: this.emptyMilestone.name,
                            start: new Date(this.emptyMilestone.start).getTime(),
                            end: new Date(this.emptyMilestone.end).getTime(),
                            status: this.emptyMilestone.status,
                            objective: this.emptyMilestone.objective,
                            resources: this.emptyMilestone.resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                            strategies: this.emptyMilestone.strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                        });

                        var x = d3.scaleTime().domain(this.range).range([0, width]);
                        var y = d3.scaleLinear().domain([0, this.ymax]).range([0, this.height]);
                        this.updateMilestoneStatus();
                        this.updateChart(this.range);
                        // reset the empty milestone
                        this.emptyMilestone = {
                            id: 10,
                            name: '',
                            objective: '',
                            start: new Date(),
                            end: new Date(),
                            status: 'progress',
                            progress: 0.0,
                            resources: [],
                            strategies: [],
                            reflections: [],
                            yLane: 0,
                            mod: false
                        };
                        $('#theMilestoneModal').modal('hide');
                        return id;
                    },
                    addMilestones: function (milestones) {
                        console.log('Is this function used anymore?')
                        // add multiple milestones to the data
                        for (var i = 0; i < milestones.length; i++) {
                            milestones[i].start = new Date(milestones[i].start.split('T')[0]);
                            milestones[i].end = new Date(milestones[i].end.split('T')[0]);
                            this.milestones.push(milestones[i]);
                        }
                        var x = d3.scaleTime().domain(this.range).range([0, width]);
                        var y = d3.scaleLinear().domain([0, this.ymax]).range([0, this.height]);
                        this.updateMilestoneStatus();
                        this.updateChart(this.range);
                    },
                    removeMilestone: function () {
                        this.closeModal(false);
                        $('div.modal-backdrop.show').remove();
                        logger.add('milestone_removed', {
                            milestoneId: this.getSelectedMilestone().id,
                            name: this.getSelectedMilestone().name,
                            start: new Date(this.getSelectedMilestone().start).getTime(),
                            end: new Date(this.getSelectedMilestone().end).getTime(),
                            status: this.getSelectedMilestone().status,
                            objective: this.getSelectedMilestone().objective,
                            resources: this.getSelectedMilestone().resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                            strategies: this.getSelectedMilestone().strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                        });
                        for (var s = 0; s < this.milestones.length; s++) {
                            if (this.milestones[s].id === this.getSelectedMilestone().id) {
                                this.milestones.splice(s, 1);
                                this.selectedMilestone = -1;
                            }
                        }
                        this.updateMilestones();
                        this.$forceUpdate(); // We want the create new ms button back!
                        return;
                    },
                    
                    validateStartDate: function (date) {
                        if (date <= this.dpRange.to || date >= this.dpRange.from) {
                            this.invalidStartDate = true;
                            return;
                        }
                        if (date > this.endDate) {
                            this.invalidEndDate = true;
                        }
                        this.invalidStartDate = false;
                        this.getSelectedMilestone().start = date;
                        return;
                    },
                    validateEndDate: function (date) {
                        if (date <= this.dpRange.to || date < this.getSelectedMilestone().start || date >= this.dpRange.from) {
                            this.invalidEndDate = true;
                            return;
                        }
                        this.invalidEndDate = false;

                        this.getSelectedMilestone().end = date;

                        return;
                    },
                    // <e> datepicker
                    daySelected: function (event, d) {
                        var day = event ? parseInt(event.target.value) : d;

                        if ([4, 6, 9, 11].indexOf(parseInt(this.selectedMonth, 10)) !== -1 && parseInt(day, 10) === 31) {
                            this.invalidDay = true;
                            this.selectedMonth++;
                            return;
                        } else if (parseInt(this.selectedMonth, 10) === 2 && day > 29) {
                            this.invalidDay = true;
                            return;
                        } else if (parseInt(this.selectedMonth, 10) === 2 && day === 29 && !(parseInt(this.selectedYear, 10) % 4 === 0 && parseInt(this.selectedYear, 10) % 100 !== 0 || parseInt(this.selectedYear, 10) % 400 === 0)) {
                            this.invalidDay = true;
                            return;
                        } else {
                            this.invalidDay = false;
                        }
                        this.selectedDay = day;

                        if (this.invalidDay === false) {
                            this.setEndDateFromSelectedValues();
                            return true;
                        }
                        return false;
                    },
                    monthSelected: function (event) {
                        this.selectedMonth = event.target.value;
                        this.daySelected(undefined, this.selectedDay); // check if the combination of day and month is valid
                    },
                    yearSelected: function (event) {
                        this.selectedYear = event.target.value;
                        this.setEndDateFromSelectedValues();
                    },
                    setEndDateFromSelectedValues: function () {
                        var endDate = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay, 23, 59, 59);
                        // Prohibit end dates before the semester start
                        if (
                            moment(endDate).diff(moment(course.startDate), 'minutes') > 0 &&
                            moment(endDate).diff(moment(new Date()), 'months') < course.maxPlaningPeriod
                        ) {
                            this.invalidEndDate = false;
                            this.getSelectedMilestone().end = endDate;
                        } else {
                            this.invalidEndDate = true;
                        }
                    },
                    startDaySelected: function (event, d) {
                        var day = event ? parseInt(event.target.value) : d;

                        if ([4, 6, 9, 11].indexOf(parseInt(this.selectedStartMonth, 10)) !== -1 && parseInt(day, 10) === 31) {
                            this.invalidStartDay = true;
                            this.selectedStartMonth++;
                            return;
                        } else if (parseInt(this.selectedStartMonth, 10) === 2 && day > 29) {
                            this.invalidDay = true;
                            return;
                        } else if (parseInt(this.selectedStartMonth, 10) === 2 && day === 29 && !(parseInt(this.selectedYear, 10) % 4 === 0 && parseInt(this.selectedYear, 10) % 100 !== 0 || parseInt(this.selectedYear, 10) % 400 === 0)) {
                            this.invalidDay = true;
                            return;
                        } else {
                            this.invalidDay = false;
                        }
                        this.selectedStartDay = day;

                        if (this.invalidStartDay === false) {
                            this.setStartDateFromSelectedValues();
                            return true;
                        }
                        return false;
                    },
                    startMonthSelected: function (event) {
                        this.selectedStartMonth = event.target.value;
                        this.startDaySelected(undefined, this.selectedStartDay); // check if the combination of day and month is valid
                    },
                    startYearSelected: function (event) {
                        this.selectedStartYear = event.target.value;
                        this.setStartDateFromSelectedValues();
                    },
                    setStartDateFromSelectedValues: function () {
                        var startDate = new Date(this.selectedStartYear, this.selectedStartMonth - 1, this.selectedStartDay, 0, 0, 0);
                        // Prohobit start dates before the semester start
                        if (
                            moment(startDate).diff(moment(course.startDate), 'minutes') > 0 &&
                            moment(startDate).diff(moment(new Date()), 'months') < course.maxPlaningPeriod
                        ) {
                            this.invalidStartDate = false;
                            this.getSelectedMilestone().start = startDate;
                        } else {
                            this.invalidStartDate = true;
                        }
                    },
                    dayRange: function () {
                        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
                    },
                    monthRange: function () {
                        return utils.monthRange;
                    },
                    yearRange: function () {
                        return [course.startDate.getFullYear(), course.endDate.getFullYear()]; // xxx should become a plugin setting
                    },
                    fromNow: function (date) {
                        return moment(date).fromNow();
                    },
                    getReadableTime: function (date) {
                        return moment(date).format("d.MM.YYYY, HH:mm");
                    },
                    strategiesByCategory: function (cat) {
                        return this.strategies.filter(function (s) {
                            return s.category === cat ? true : false;
                        });
                    },
                    strategyById: function (id) {
                        return JSON.parse(JSON.stringify(this.strategies.filter(function (s) {
                            return s.id === id ? true : false;
                        })[0]));
                    },
                    resourcesBySection: function (id) {
                        return this.resources.filter(function (s) {
                            return parseInt(s.section_id, 10) === parseInt(id, 10) ? true : false;
                        });
                    },
                    resourceSections: function () {
                        var sections = {};
                        for (var i = 0; i < this.resources.length; i++) {
                            /*if (this.resources[i].section_name === ' '){
                             console.log(this.resources[i].section_id + '__' + this.resources[i].section_name + '__' + this.resources[i].name)
                            }*/
                            if (this.resources[i] === undefined) {
                                return 0;
                            }
                            sections[this.resources[i].section_id] = {
                                name: this.resources[i].section_name === ' ' ? '(Einführung)' : this.resources[i].section_name,
                                id: this.resources[i].section_id
                            };
                        }
                        return sections;
                    },
                    resourceById: function (id) {
                        return JSON.parse(JSON.stringify(this.resources.filter(function (s) {
                            return parseInt(s.id, 10) === parseInt(id, 10) ? true : false;
                        })[0]));
                    },
                    getInstanceTypeTitel: function (instance_type) {
                        switch (instance_type) {
                            case 'forum': return 'Forum';
                            case 'assign': return 'Einsendeaufgabe';
                            case 'quiz': return 'Selbsttest';
                            case 'studentquiz': return 'Selbsttest';
                            case 'page': return 'Text';
                            case 'kurstermin': return 'Termin';
                            case 'data': return 'Text';
                            case 'hvp': return '';
                            case 'checklist': return '';
                            case 'url': return 'Link';
                            case 'feedback': return 'Feedback';
                            case 'resource': return 'Material';
                            case 'glossary': return 'Glossar';
                            case 'wiki': return 'Wiki';
                            default: return instance_type;
                        }
                    },
                    strategySelected: function (id) {
                        var el = this.strategyById(id);
                        if (this.getSelectedMilestone().strategies.indexOf(el) === -1) {
                            this.getSelectedMilestone().strategies.push(el);
                        }
                        this.invalidStrategy = this.getSelectedMilestone().strategies.length > 0 ? false : true;
                    },
                    isSelectedStrategy: function (id) {
                        return this.getSelectedMilestone().strategies.filter(function (e) {
                            return e.id === id ? true : false;
                        }).length > 0 ? true : false;
                    },
                    strategyRemove: function (id) {
                        for (var s = 0; s < this.getSelectedMilestone().strategies.length; s++) {
                            if (this.getSelectedMilestone().strategies[s].id === id) {
                                this.getSelectedMilestone().strategies.splice(s, 1);
                            }
                        }
                        this.invalidStrategy = this.getSelectedMilestone().strategies.length > 0 ? false : true;
                    },
                    resourceSelected: function (event) {
                        var el = this.resourceById(event.target.value);
                        if (this.getSelectedMilestone().resources.indexOf(el) === -1) {
                            this.getSelectedMilestone().resources.push(el);
                        }
                        this.invalidResources = this.getSelectedMilestone().resources.length > 0 ? false : true;
                    },
                    resourceRemove: function (id) {
                        for (var s = 0; s < this.getSelectedMilestone().resources.length; s++) {
                            if (this.getSelectedMilestone().resources[s].id === id) {
                                this.getSelectedMilestone().resources.splice(s, 1);
                            }
                        }
                        this.invalidResources = this.getSelectedMilestone().resources.length > 0 ? false : true;
                    },
                    limitTextLength: function (str, max, end) {
                        var len = str.length;
                        if (len > max) {
                            return str.substr(0, max - 4) + '...' + (end ? str.substr(len - 4, len) : '');
                        } else {
                            return str;
                        }
                    },
                    determineMilestoneProgress: function (milestone) {
                        var resourceProgress = 0;
                        var strategiesProgress = 0;

                        resourceProgress = milestone.resources.filter(function (e) {
                            return e.checked === true ? true : false;
                        }).length / milestone.resources.length;

                        strategiesProgress = milestone.strategies.filter(function (e) {
                            return e.checked === true ? true : false;
                        }).length / milestone.strategies.length;

                        return ((resourceProgress + strategiesProgress) / 2);
                    },
                    updateMilestones: function () {
                        this.sortMilestones();
                        // Update Milestones to the database using the webservice
                        var _this = this;
                        let ms = _this.milestones.filter(
                            function (element) {
                                if (element.mod !== true) {
                                    return true;
                                }
                                if (typeof element.mod === "undefined") element.mod = false;
                                return false;
                            }
                        );
                        utils.get_ws('setmilestones', {
                            data: {
                                'courseid': parseInt(course.id, 10),
                                'milestones': JSON.stringify(ms),
                                'settings': JSON.stringify({})
                            }
                        }, function (e) {
                            //
                            // var t = _this.milestones.map(function(e){ return e.name; })
                            // console.log('save', JSON.parse(e.response), t);
                        });
                    },
                    updateMilestoneStatus: function () {
                        if (this.milestones === null || this.milestones === undefined) {
                            return;
                        }
                        var t = new Date();
                        for (var i = 0; i < this.milestones.length; i++) {
                            var diff = moment(t).diff(moment(this.milestones[i].end), 'minutes');

                            this.milestones[i].status = 'progress';

                            // update progress
                            this.milestones[i].progress = this.determineMilestoneProgress(this.milestones[i]);
                            if ((diff < 0 && diff > -4320) && this.milestones[i].progress !== 1) {
                                this.milestones[i].status = 'urgent';
                            }

                            if (diff > 0 && this.milestones[i].progress !== 1) {
                                this.milestones[i].status = 'missed';
                            }

                            if (this.milestones[i].progress === 1) {
                                this.milestones[i].status = 'ready';
                            }

                            if (this.milestones[i].progress === 1 && this.milestones[i].reflections.length > 0) {
                                this.milestones[i].status = 'reflected';
                            }
                        }
                        // highlight selected activities
                        this.hightlightSelectedResources();
                        this.updateMilestones();
                    },
                    hightlightSelectedResources: function () {
                        // add a milestone batch for every resource or activity that was selected by a milesone
                        var badge = "";
                        // clean up and reset first
                        $('.badge-ms').each(function () {
                            $(this).remove();
                        });
                        let c = this;
                        for (var j = 0; j < this.milestones.length; j++) {
                            let pos = this.milestones[j].id;
                            let obj = this.milestones[j];
                            for (var i = 0; i < this.milestones[j].resources.length; i++) {
                                badge = $('<span></span>')
                                    .addClass('badge badge-secondary badge-ms')
                                    .attr('data-toggle', 'tooltip')
                                    .click(
                                        function () {
                                            if (obj.status === "missed" || obj.status === "reflected") {
                                                c.moveToMilestoneArchiveListEntry(pos, true);
                                            } else {
                                                c.moveToMilestoneListEntry(pos, true);
                                            }
                                        }
                                    )
                                    .css({
                                        "user-select": "none",
                                        "cursor": "pointer"
                                    })
                                    ;
                                if (!this.milestones[j].resources[i].checked && this.milestones[j].status === 'missed' && new Date() <= moment(this.milestones[j].end).add(1, 'w').toDate()) {
                                    badge
                                        .html('<i class="fa fa-exclamation"></i>' + this.limitTextLength(this.milestones[j].name, 14))
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" noch nicht erledigt oder als "erledigt" markiert.')
                                        .addClass('badge-missed')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                if (!this.milestones[j].resources[i].checked && this.milestones[j].status === 'progress') {
                                    badge
                                        .html('<i class="fa fa-square-o"></i>' + this.limitTextLength(this.milestones[j].name, 14))
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" noch nicht erledigt oder als "erledigt" markiert.')
                                        .addClass('badge-progress')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                if (!this.milestones[j].resources[i].checked && this.milestones[j].status === 'urgent') {
                                    badge
                                        .html('<i class="fa fa-square-o"></i>' + this.limitTextLength(this.milestones[j].name, 14))
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" noch nicht erledigt oder als "erledigt" markiert.')
                                        .addClass('badge-urgent')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                if (this.milestones[j].resources[i].checked) {
                                    var _this = this;
                                    badge
                                        .html('<i class="fa fa-check-square"></i><span>' + _this.limitTextLength(_this.milestones[j].name, 14) + '</span>')
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" bereits als "erledigt" markiert.')
                                        .addClass('badge-ready')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                /* 
                                .removeClass('resource-highlight')
                                .removeClass('resource-highlight-done')
                                .addClass(this.milestones[j].resources[i].checked ? 'resource-highlight-done' : 'resource-highlight')
                                
                                ;*/
                            }
                        }
                    },
                    toggleReflectionsForm: function () {
                        this.reflectionsFormVisisble = !this.reflectionsFormVisisble;
                        logger.add('reflections_open', { formVisible: true });
                    },
                    validateReflectionForm: function () {
                        this.invalidReflections = [];
                        let r = this.getSelectedMilestone().reflections;

                        for (let i = 0; i < r.length; i++) {
                            if (r[i] === undefined || r[i] === null) {
                                this.invalidReflections.push(i + 1);
                            } else if (r[i].length === 0) {
                                this.invalidReflections.push(i + 1);
                            } else {
                                // console.log(r[i]);
                            }
                        }
                        if (r.length === 4 && this.invalidReflections.length === 0) {
                            this.submitReflections();
                        }
                    },
                    submitReflections: function () {
                        this.getSelectedMilestone().status = 'reflected';
                        logger.add('reflections_completed', {
                            milestoneId: this.getSelectedMilestone().id,
                            name: this.getSelectedMilestone().name,
                            reflections: this.getSelectedMilestone().reflections
                        });
                        var t = this.milestones.filter(function (e) {
                            return e.reflections;
                        });
                        this.updateMilestones();
                        $('#theReflectionModal').modal('hide');
                    },
                    setFilterPreset: function (preset) {
                        var range = [];
                        var now = new Date();
                        this.filterPreset = preset;
                        logger.add('time_filter_selected', { selectedFilter: preset });
                        switch (preset) {
                            case "next-week":
                                range = [new Date(now.getTime() + 1000 * 3600 * 24 * 1), new Date(now.getTime() + 1000 * 3600 * 24 * 7)];
                                break;
                            case "next-month":
                                range = [new Date(now.getTime() + 1000 * 3600 * 24 * 1), new Date(now.getTime() + 1000 * 3600 * 24 * 30)];
                                break;
                            case "today":
                                range = [new Date(now.getTime() - 1000 * 3600 * 24 * 3), new Date(now.getTime() + 1000 * 3600 * 24 * 3)];
                                break;
                            case "last-week":
                                range = [new Date(now.getTime() - 1000 * 3600 * 24 * 7), new Date(now.getTime() + 1000 * 3600 * 24 * 1)];
                                break;
                            case "last-month":
                                range = [new Date(now.getTime() - 1000 * 3600 * 24 * 30), new Date(now.getTime() + 1000 * 3600 * 24 * 1)];
                                break;
                            case "semester":
                                range = [course.startDate, course.endDate];
                        }
                        this.timeFilterChart.replaceFilter(dc.filters.RangedFilter(range[0], range[1]));
                        this.timeFilterChart.filterTime();
                    },
                    sortMilestones: function () {
                        this.milestones.sort(
                            function (a, b) {
                                let x = new Date(a.end);
                                let y = new Date(b.end);
                                let now = new Date();
                                if (a.status === "urgent" && b.status !== "urgent") return -1;
                                if (b.status === "urgent" && a.status !== "urgent") return 1;
                                if (a.status === "progress" && b.status !== "progress") return -1;
                                if (b.status === "progress" && a.status !== "progress") return 1;
                                if (a.status === "ready" && b.status !== "ready") return -1;
                                if (b.status === "ready" && a.status !== "ready") return 1;
                                if (a.status === "reflected" && b.status !== "reflected") return -1;
                                if (b.status === "reflected" && a.status !== "reflected") return 1;
                                if (a.end >= now && b.end < now) return -1;
                                if (b.end >= now && a.end < now) return 1;
                                if (x < now && y < now) return y - x;
                                return x - y;
                            }
                        );
                    },
                    /* exportToICal: function (link) {
                        
                        this.$refs.MilestoneCalendarExport.exportToICal(link);
                    },
                   
                    exportToICal: function (link) {
                        try {
                            // Initialize the calendar
                            let config = {
                                prodid: "APLE",
                                domain: "APLE",
                                tzid: "Europe/Berlin",
                                type: "Gregorian",
                                version: "2.0"
                            }
                            let cal = new ICalExport(ICalLib, config);
                            // Register all Milestones
                            if (this.milestones && this.milestones.length > 0) {
                                this.milestones.forEach(
                                    (milestone) => {
                                        try {
                                            let initDate = new Date(milestone.end.toISOString());
                                            initDate.setHours(12);
                                            initDate.setMinutes(0);
                                            initDate.setSeconds(0);
                                            let data = {
                                                uid: milestone.id,
                                                title: "[Meilenstein] " + milestone.name,
                                                start: initDate
                                            }
                                            // Generate description
                                            let description = milestone.objective ? "Lernziel: " + milestone.objective : "";
                                            if (milestone.resources && milestone.resources.length > 0) {
                                                description += "\n\nZu diesem Meilenstein gehören folgende Lernressourcen:";
                                                milestone.resources.forEach(
                                                    (resource) => {
                                                        let done = resource.checked ? "[erledigt] " : "";
                                                        if (resource.instance_title) description += "\n- " + done + resource.instance_title;
                                                    }
                                                )
                                            }
                                            if (milestone.strategies && milestone.strategies.length > 0) {
                                                description += "\n\nZu diesem Meilenstein gehören folgende Lernstrategien:";
                                                milestone.strategies.forEach(
                                                    (strategie) => {
                                                        let done = strategie.checked ? "[erledigt] " : "";
                                                        if (strategie.name) description += "\n- " + done + strategie.name;
                                                    }
                                                )
                                            }
                                            data.description = description;
                                            let event = cal.addEvent(data);
                                            // Set an alarm three days before end.
                                            let date = new Date(milestone.start.toISOString());
                                            date.setDate(date.getDate() - 3);
                                            cal.addAlarm(event, {
                                                type: 0,
                                                title: data.title,
                                                date: date,
                                                description: "Der Meilenstein " + data.title + " ist fast erreicht!"
                                            });
                                            // Set an alarm one week before end.
                                            date.setDate(date.getDate() - 4);
                                            cal.addAlarm(event, {
                                                type: 0,
                                                title: data.title,
                                                date: date,
                                                description: "Der Meilenstein " + data.title + " ist bald erreicht!"
                                            });
                                        } catch (error) {
                                            new ErrorHandler(error);
                                        }
                                    }
                                );
                            }
                            // Register all calendar events                   
                            if (typeof this.calendar === "object" && Object.keys(this.calendar).length > 0) {
                                Object.keys(this.calendar).forEach(
                                    (id) => {
                                        try {
                                            let entry = this.calendar[id];
                                            let type = "[Nutzertermin]";
                                            switch (entry.eventtype) {
                                                case "course": type = "[Kurstermin]"
                                                    break;
                                                case "category": type = "[Kursbereich]"
                                                    break;
                                                case "site": type = "[Seitentermin]"
                                                    break;
                                                case "group": type = "[Gruppentermin]"
                                                    break;
                                            }
                                            let data = {
                                                uid: id + entry.timemodified,
                                                title: type + " " + entry.name,
                                                start: new Date(entry.timestart * 1000)
                                            }
                                            if (entry.timeduration) data.stop = new Date(entry.timestart * 1000 + entry.timeduration * 1000);
                                            data.description = entry.description;
                                            let event = cal.addEvent(data);
                                            // Set an alarm three days before end.
                                            let date = new Date(data.start.toISOString());
                                            date.setDate(date.getDate() - 3);
                                            cal.addAlarm(event, {
                                                type: 0,
                                                title: data.title,
                                                date: date,
                                                description: "Der Termin " + data.title + " ist fast erreicht!"
                                            });
                                            // Set an alarm one week before end.
                                            date.setDate(date.getDate() - 4);
                                            cal.addAlarm(event, {
                                                type: 0,
                                                title: data.title,
                                                date: date,
                                                description: "Der Termin " + data.title + " ist bald erreicht!"
                                            });
                                        } catch (error) {
                                            new ErrorHandler(error);
                                        }
                                    }
                                )
                            }
                            let now = new Date();
                            let year = now.getFullYear().toString().padStart(4, "0");
                            let month = now.getMonth() + 1;
                            month = month.toString().padStart(2, "0");
                            let day = now.getDate().toString().padStart(2, "0");
                            let hour = now.getHours().toString().padStart(2, "0");
                            let minutes = now.getMinutes().toString().padStart(2, "0");
                            let title = document.title.replace(/[^A-Za-z0-9]/g, "");
                            var link = document.createElement("a");
                            link.href = "data:text/calendar;charset=utf-8," + escape(cal.print());
                            link.download = "Semesterplanung_" + title + "_" + year + month + day + hour + minutes + ".ics";
                            link.click();
                        } catch (error) {
                            new ErrorHandler(error);
                        }
                    },*/
                    createMilestonePicker: function () {
                        let _this = this;
                        let updateMilestoneList = function (id) {
                            try {
                                let list = "";
                                _this.milestones.forEach(
                                    (element) => {
                                        if (element.status === "reflected" || (element.status === "missed" && new Date() > moment(element.end).add(1, 'w').toDate())) return;
                                        let icon = "fa-square";
                                        if (typeof element.resources === "object") {
                                            element.resources.forEach(
                                                (res) => {
                                                    if (+res.instance_url_id === id) icon = "fa-check-square";
                                                }
                                            )
                                        }
                                        list += "<a class=\"dropdown-item\" href=\"#\" id=\"" + element.id + "\"><i class=\"icon fa " + icon + "\"></i>" + element.name + "</a>";
                                    }
                                );
                                return list.length <= 0 ? "<span class=\"px-2\" style=\"user-select:none;\">Kein Meilenstein</span>" : list;
                            } catch (error) {
                                return "<div class=\"dropdown-item\">Meilensteine konnten nicht geladen werden.</div>";
                            }
                        }
                        $(document).ready(function () {
                            let instances = $(".activityinstance");
                            instances.each(
                                function (index) {
                                    try {
                                        // get all important data
                                        let element = $(this);
                                        let link = element.find("a").eq(0);
                                        if (link.length !== 1) return;
                                        let href = link.attr("href");
                                        if (typeof href === "undefined" || href.length <= 0) return;
                                        let posID = href.indexOf("id=");
                                        if (posID === -1) return;
                                        let id = +href.slice(posID + 3);
                                        if (typeof id !== "number" || id < 0) return;
                                        // add the dom elements
                                        let dom = " \
                                            <div class=\"dropdown milestone_picker\"> \
                                                <a href=\"#\" class=\"badge dropdown-toggle\" \
                                                    href=\"#\" role=\"button\" \
                                                    data-toggle=\"dropdown\" aria-haspopup=\"true\" \
                                                    aria-expanded=\"false\"> \
                                                    Meilensteine \
                                                </a> \
                                                <div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuLink\"> \
                                                </div> \
                                            </div> \
                                        ";
                                        let picker = $(dom).insertAfter(link);
                                        let dropdown = picker.find(".dropdown-menu");
                                        dropdown.css({
                                            "display": "none"
                                        });
                                        let pickerLink = picker.find("a");
                                        pickerLink.css({
                                            "background-color": "transparent",
                                            "color": "black",
                                            "font-weight": "normal"
                                        });
                                        $(document).click(function (e) {
                                            // blur does not work on <div>
                                            if ($(e.target).is('.milestone_picker .dropdown-menu, .milestone_picker .dropdown-menu *')) return;
                                            $(".milestone_picker .dropdown-menu").css({
                                                "display": "none"
                                            });
                                        });
                                        pickerLink.click(function (e) {
                                            e.preventDefault();
                                            if (dropdown.css("display") !== "block") {
                                                dropdown.empty();
                                                let data = updateMilestoneList(id);
                                                $(data).prependTo(dropdown);
                                                $(".milestone_picker .dropdown-menu").css({
                                                    "display": "none"
                                                });
                                                let entries = dropdown.find("a.dropdown-item");
                                                entries.each(function () {
                                                    let entry = $(this);
                                                    let entryID = +entry.attr("id");
                                                    let icon = $(this).find("i.icon");
                                                    if (typeof entryID === "number") {
                                                        entry.click(function (e) {
                                                            e.preventDefault();
                                                            if (typeof _this.milestones === "object" && typeof _this.resources === "object") {
                                                                for (let i in _this.milestones) {
                                                                    if (_this.milestones[i]["id"] === entryID) {
                                                                        for (let u in _this.resources) {
                                                                            if (+_this.resources[u]["instance_url_id"] === id) {
                                                                                if (typeof _this.milestones[i]["resources"] === "object") {
                                                                                    if (Object.keys(_this.milestones[i]["resources"]).length > 0) {
                                                                                        let found = null;
                                                                                        for (let t in _this.milestones[i]["resources"]) {
                                                                                            if (+_this.milestones[i]["resources"][t]["instance_url_id"] === id) {
                                                                                                found = t;
                                                                                            }
                                                                                        }
                                                                                        if (found !== null) {
                                                                                            _this.milestones[i]["resources"].splice(found, 1);
                                                                                            icon.removeClass("fa-check-square");
                                                                                            icon.addClass("fa-square");
                                                                                        } else {
                                                                                            _this.milestones[i]["resources"].push(_this.resources[u]);
                                                                                            icon.addClass("fa-check-square");
                                                                                            icon.removeClass("fa-square");
                                                                                        }
                                                                                    } else {
                                                                                        _this.milestones[i]["resources"].push(_this.resources[u]);
                                                                                        icon.addClass("fa-check-square");
                                                                                        icon.removeClass("fa-square");
                                                                                    }
                                                                                } else {
                                                                                    _this.milestones[i]["resources"] = array(_this.resources[u]);
                                                                                    icon.addClass("fa-check-square");
                                                                                    icon.removeClass("fa-square");
                                                                                }
                                                                                _this.updateMilestoneStatus();
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                                dropdown.css({
                                                    "display": "block"
                                                });
                                            } else {
                                                $(".milestone_picker .dropdown-menu").css({
                                                    "display": "none"
                                                });
                                            }
                                        });
                                    } catch (error) { }
                                }
                            )
                        });
                    },
                    moveToMilestoneTimelineEntry: function (mID, rangeOfDays) {
                        try {
                            this.showAdditionalCharts();
                            $('a[href="#view-timeline"]').tab("show");
                            let element = undefined;
                            this.milestones.forEach(
                                (ms) => {
                                    if (ms.id === mID) element = ms;
                                }
                            );
                            if (typeof element === "object") {
                                let start = new Date(element.start.toISOString());
                                start.setDate(start.getDate() - rangeOfDays);
                                start.setHours(0);
                                start.setMinutes(0);
                                start.setSeconds(0);
                                if (element.stop instanceof Date) {
                                    var stop = new Date(element.stop.toISOString());
                                } else {
                                    var stop = new Date(element.start.toISOString());
                                }
                                stop.setDate(stop.getDate() + rangeOfDays);
                                stop.setHours(23);
                                stop.setMinutes(59);
                                stop.setSeconds(59);
                                this.timeFilterChart.replaceFilter(dc.filters.RangedFilter(start, stop));
                                this.timeFilterChart.filterTime();
                                $('html, body').animate({
                                    scrollTop: $("div.ladtopics").offset().top - $("nav.navbar").outerHeight()
                                }, 1000);
                                $("#filter-presets").find("button").css("text-decoration", "none");

                            }
                        } catch (error) { }
                    },
                    moveToMilestoneArchiveListEntry: function (mID, collapseOther) {
                        try {
                            this.hideAdditionalCharts();
                            $('a[href="#view-archive-list"]').tab("show");
                            let promises = [];
                            $("div.milestone-entry-details").each(
                                function () {
                                    let detail = $(this);
                                    let dID = detail.attr("id");
                                    if (dID === "milestone-entry-archive-" + mID) {
                                        let show = function () {
                                            detail.off("show.bs.collapse", show);
                                            promises.push(new Promise(
                                                (resolve, reject) => {
                                                    let shown = function () {
                                                        detail.off("shown.bs.collapse", shown);
                                                        return resolve();
                                                    }
                                                    detail.on("shown.bs.collapse", shown);
                                                }
                                            ));
                                        }
                                        detail.on("show.bs.collapse", show);
                                        detail.collapse("show");
                                        detail.off("show.bs.collapse", show);
                                    } else {
                                        if (collapseOther) {
                                            let hide = function () {
                                                detail.off("hide.bs.collapse", hide);
                                                promises.push(new Promise(
                                                    (resolve, reject) => {
                                                        let hidden = function () {
                                                            detail.off("hidden.bs.collapse", hidden);
                                                            return resolve();
                                                        }
                                                        detail.on("hidden.bs.collapse", hidden);
                                                    }
                                                ));
                                            }
                                            detail.on("hide.bs.collapse", hide);
                                            detail.collapse("hide");
                                            detail.off("hide.bs.collapse", hide);
                                        }
                                    }
                                }
                            );
                            Promise.all(promises).then(
                                (resove) => {
                                    if ($("#milestone-entry-archive-" + mID).length) {
                                        $('html, body').animate({
                                            scrollTop: $("#milestone-entry-archive-" + mID).parent().offset().top - $("nav.navbar").outerHeight()
                                        }, 1000);
                                    }
                                }
                            )
                        } catch (error) { }
                    },
                    moveToMilestoneListEntry: function (mID, collapseOther) {
                        try {
                            this.hideAdditionalCharts();
                            $('a[href="#view-list"]').tab("show");
                            let promises = [];
                            $("div.milestone-entry-details").each(
                                function () {
                                    let detail = $(this);
                                    let dID = detail.attr("id");
                                    if (dID === "milestone-entry-" + mID) {
                                        let show = function () {
                                            detail.off("show.bs.collapse", show);
                                            promises.push(new Promise(
                                                (resolve, reject) => {
                                                    let shown = function () {
                                                        detail.off("shown.bs.collapse", shown);
                                                        return resolve();
                                                    }
                                                    detail.on("shown.bs.collapse", shown);
                                                }
                                            ));
                                        }
                                        detail.on("show.bs.collapse", show);
                                        detail.collapse("show");
                                        detail.off("show.bs.collapse", show);
                                    } else {
                                        if (collapseOther) {
                                            let hide = function () {
                                                detail.off("hide.bs.collapse", hide);
                                                promises.push(new Promise(
                                                    (resolve, reject) => {
                                                        let hidden = function () {
                                                            detail.off("hidden.bs.collapse", hidden);
                                                            return resolve();
                                                        }
                                                        detail.on("hidden.bs.collapse", hidden);
                                                    }
                                                ));
                                            }
                                            detail.on("hide.bs.collapse", hide);
                                            detail.collapse("hide");
                                            detail.off("hide.bs.collapse", hide);
                                        }
                                    }
                                }
                            );
                            Promise.all(promises).then(
                                (resove) => {
                                    if ($("#milestone-entry-" + mID).length) {
                                        $('html, body').animate({
                                            scrollTop: $("#milestone-entry-" + mID).parent().offset().top - $("nav.navbar").outerHeight()
                                        }, 1000);
                                    }
                                }
                            )
                        } catch (error) { }
                    },
                    modAlert: function (type, text) {
                        let field = $("#moderationAlert");
                        field.removeClass();
                        field.addClass("alert");
                        switch (type) {
                            case "success": field.addClass("alert-success");
                                break;
                            case "danger": field.addClass("alert-danger");
                                break;
                            case "warning": field.addClass("alert-warning");
                                break;
                            case "info": field.addClass("alert-info");
                                break;
                            default: field.addClass("alert-secondary");
                        }
                        field.text(text);
                        field.fadeIn('slow', function () {
                            $(this).delay(2000).fadeOut('slow');
                        });
                    },
                    modLoadPath: function (e) {
                        try {
                            let file = document.getElementById('modImportedFile').files[0];
                            if (typeof file.name === "string" && file.name.length > 0) {
                                $("#modLoadPathLabel").text(file.name);
                                $("#moderationModal").one('hidden.bs.modal', function () {
                                    $("#modLoadPathLabel").text("Bitte wählen Sie eine Datei aus.");
                                    document.getElementById('modImportedFile').value = "";
                                });
                            }
                        } catch (error) {
                            new ErrorHandler(error);
                        }
                    },
                    modLoadMilestones: function () {
                        try {
                            let file = document.getElementById('modImportedFile').files[0];
                            $("#modLoadPathLabel").text("Bitte wählen Sie eine Datei aus.");
                            document.getElementById('modImportedFile').value = "";
                            if (file === undefined) {
                                this.modAlert("warning", "Bitte wählen Sie eine Datei aus.");
                                return;
                            }
                            if (file.type !== "application/json") {
                                this.modAlert("warning", "Es wird eine Datei im JSON-Format benötigt.");
                                return;
                            }
                            if (file.size <= 0) {
                                this.modAlert("danger", "Die Datei ist fehlerhaft.");
                                return;
                            }
                            const reader = new FileReader();
                            const _this = this;
                            reader.readAsText(file);
                            reader.onload = function (evt) {
                                try {
                                    let result = evt.target.result;
                                    let json = JSON.parse(result);
                                    if (typeof json !== "object" || !Array.isArray(json)) {
                                        this.modAlert("danger", "Die Datei ist fehlerhaft.");
                                        return;
                                    }
                                    json.forEach(
                                        function (element) {
                                            Object.assign(_this.emptyMilestone, element);
                                            _this.emptyMilestone.start = moment(element.start).toDate();
                                            _this.emptyMilestone.end = moment(element.end).toDate();
                                            _this.createMilestone();
                                        }
                                    );
                                    _this.updateMilestones();
                                    _this.modAlert("success", "Meilensteine wurden geladen.");
                                } catch (error) {
                                    new ErrorHandler(error);
                                }
                            };
                            reader.onerror = function (error) {
                                _this.modAlert("warning", "Die Datei konnte nicht gelesen werden.");
                                new ErrorHandler(error);
                            }
                        } catch (error) {
                            this.modAlert("danger", "Konnte die Meilensteine nicht laden.");
                            new ErrorHandler(error);
                        }
                    },
                    modSaveSelect: function () {
                        let ms = this.milestones.filter(
                            function (element) {
                                if (element.mod !== true) {
                                    return true;
                                }
                                return false;
                            }
                        );
                        if (ms.length <= 0) {
                            this.modAlert("warning", "Keine Meilensteine vorhanden.");
                            return;
                        }
                        if ($("#modSaveInterest").is(":checked")) {
                            this.modSaveMilestones("interest", ms, false);
                        } else if ($("#modSaveOrientation").is(":checked")) {
                            this.modSaveMilestones("orientation", ms, false);
                        } else if ($("#modSaveExam").is(":checked")) {
                            this.modSaveMilestones("exam", ms, false);
                        } else if ($("#modSaveLocal").is(":checked")) {
                            this.exportMilestones(ms);
                        } else {
                            this.exportMilestones(ms);
                        }
                        return;
                    },
                    modResetSelect: function () {
                        var check = confirm('Wollen Sie wirklich alle Meilensteine zurücksetzen?');
                        if (check === true) {
                            if ($("#modSaveInterest").is(":checked")) {
                                this.modSaveMilestones("interest", [], false);
                            } else if ($("#modSaveOrientation").is(":checked")) {
                                this.modSaveMilestones("orientation", [], false);
                            } else if ($("#modSaveExam").is(":checked")) {
                                this.modSaveMilestones("exam", [], false);
                            } else if ($("#modSaveLocal").is(":checked")) {
                                this.resetMilestones();
                            } else {
                                this.resetMilestones();
                            }
                        }
                        return;

                    },
                    modResetPlan: function () {
                        var check = confirm('Wollen Sie wirklich ihren Semesterplan zurücksetzen?');
                        if (check === true) {
                            let todo = [];
                            todo.push(new Promise(
                                (resolve, reject) => {
                                    utils.get_ws('userpreferences', {
                                        data: {
                                            'setget': 'set',
                                            'courseid': parseInt(course.id, 10),
                                            'fieldname': 'ladtopics_survey_done',
                                            'value': 0
                                        }
                                    }, function (e) {
                                        return resolve();
                                    });
                                }
                            ));
                            todo.push(new Promise(
                                (resolve, reject) => {
                                    utils.get_ws('userpreferences', {
                                        data: {
                                            'setget': 'set',
                                            'courseid': parseInt(course.id, 10),
                                            'fieldname': 'ladtopics_survey_results',
                                            'value': ""
                                        }
                                    }, function (e) {
                                        return resolve();
                                    });
                                }
                            ));
                            Promise.all(todo).then(
                                (resolve) => {
                                    location.reload();
                                },
                                (reject) => {
                                    console.log(reject);
                                }
                            )
                        }
                        return;
                    },
                    modSaveMilestones: function (plan, milestones, reset = true) {
                        let _this = this;
                        try {
                            utils.get_ws('setmilestoneplan', {
                                data: {
                                    'courseid': parseInt(course.id, 10),
                                    'milestones': JSON.stringify(milestones),
                                    'plan': plan
                                }
                            }, function (e) {
                                let out = JSON.parse(e.data);
                                if (out.success === true) {
                                    if (reset) {
                                        _this.milestones = [];
                                        _this.updateMilestones();
                                    } else {
                                        let ms = [];
                                        for (let u in _this.milestones) {
                                            if (_this.milestones[u].mod !== true) ms.push(_this.milestones[u]);
                                        }
                                        _this.milestones = ms;
                                    }
                                    _this.getMilestonePlan();
                                    _this.modAlert("success", "Meilensteine wurden aktualisiert.");
                                } else {
                                    if (typeof out.debug === "string" && out.debug.length > 0) {
                                        _this.modAlert("danger", out.debug);
                                    } else {
                                        _this.modAlert("danger", "Unbekannter Fehler");
                                    }
                                }
                            });
                        } catch (error) {
                            this.modAlert("danger", "Konnte die Meilensteine nicht speichern.");
                        }
                    },
                    resetMilestones: function () {
                        try {
                            this.milestones = [];
                            this.updateMilestones();
                            this.modAlert("success", "Meilensteine wurden zurückgesetzt.");
                        } catch (error) {
                            this.modAlert("danger", "Konnte die Meilensteine nicht zurücksetzen.");
                            new ErrorHandler(error);
                        }
                    },
                    exportMilestones: function (ms) {
                        try {
                            var link = document.createElement("a");
                            let json = JSON.stringify(ms);
                            link.href = "data:text/json;charset=utf-8," + json;
                            let now = new Date();
                            let year = now.getFullYear().toString().padStart(4, "0");
                            let month = now.getMonth() + 1;
                            month = month.toString().padStart(2, "0");
                            let day = now.getDate().toString().padStart(2, "0");
                            let hour = now.getHours().toString().padStart(2, "0");
                            let minutes = now.getMinutes().toString().padStart(2, "0");
                            link.download = "Meilensteinplanung_" + year + month + day + hour + minutes + ".json";
                            link.click();
                        } catch (error) {
                            new ErrorHandler(error);
                        }
                    },
                    sendMail: function (subject, text) {
                        try {
                            utils.get_ws("sendmail", {
                                'courseid': parseInt(course.id, 10),
                                'subject': "hello",
                                'text': "jo"
                            }, function (u) {

                            });
                        } catch (error) {
                            console.log(error);
                        }
                    },
                    modGetStatisticData: function (parent) {
                        try {
                            let _this = parent;
                            new Promise(
                                (resolve, reject) => {
                                    utils.get_ws("statistics", {
                                        'courseid': parseInt(course.id, 10)
                                    }, function (u) {
                                        let obj = JSON.parse(u.data);
                                        return resolve(obj);
                                    });
                                }
                            ).then(
                                (resolve) => {
                                    if ($('#stUserList').length > 0) {
                                        $('#stUserList tr:gt(1)').remove();
                                    }
                                    $('#modWorkload tr').not(':first').not(':last').remove();
                                    _this.modStatistics.users = resolve.num_users ? +resolve.num_users : 0;
                                    _this.modStatistics.surveys = resolve.num_survey ? +resolve.num_survey : 0;
                                    _this.modStatistics.msProgessed = 0,
                                        _this.modStatistics.msReady = 0,
                                        _this.modStatistics.msUrgent = 0,
                                        _this.modStatistics.msMissed = 0,
                                        _this.modStatistics.msReflected = 0
                                    _this.modStatistics.ptExam = 0;
                                    _this.modStatistics.ptOrientation = 0;
                                    _this.modStatistics.ptInterest = 0;
                                    _this.modStatistics.ptNoAnswer = 0;
                                    _this.modStatistics.ptW1 = 0;
                                    _this.modStatistics.ptW4 = 0;
                                    _this.modStatistics.ptWA = 0;
                                    _this.modStatistics.ptWA2 = 0;
                                    _this.modStatistics.ptWA4 = 0;
                                    _this.modStatistics.ptWANA = 0;
                                    _this.modStatistics.ptSum = 0;
                                    _this.modStatistics.ptMS = 0;
                                    _this.modStatistics.ptUser = 0;
                                    _this.modStatistics.milestones = 0;

                                    let createPie = function (parent, data, color) {
                                        for (let i in data) {
                                            if (data[i] <= 0) {
                                                delete (data[i]);
                                            }
                                        }
                                        if (Object.keys(data).length <= 0) return;
                                        let jqp = $(parent);
                                        if (jqp.length > 0) {
                                            jqp.empty();
                                            let width = jqp.width() / 2;
                                            let radius = width / 2 - 20;
                                            let chart = d3.select(parent)
                                                .append("svg")
                                                .attr("width", width)
                                                .attr("height", width)
                                            chart.append("g").attr("class", "slices").attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");
                                            chart.append("g").attr("class", "labels").attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");
                                            var color = d3.scaleOrdinal()
                                                .domain(data)
                                                .range(color);
                                            var pie = d3.pie().value(function (d) { return d.value; });
                                            var data_ready = pie(d3.entries(data));

                                            $(parent + " svg").css({
                                                "margin": "auto",
                                                "display": "block"
                                            });

                                            var arcGenerator = d3.arc()
                                                .innerRadius(0)
                                                .outerRadius(radius);

                                            chart
                                                .select('.slices')
                                                .selectAll("path.slice")
                                                .data(data_ready)
                                                .enter()
                                                .append('path')
                                                .attr('d', arcGenerator)
                                                .attr('fill', function (d) { return (color(d.data.key)) })
                                                .attr("stroke", "black")
                                                .style("stroke-width", "2px")
                                                .style("opacity", 0.7);
                                            chart
                                                .select('.labels')
                                                .selectAll("text")
                                                .data(data_ready)
                                                .enter()
                                                .append('text')
                                                .text(function (d) { return d.data.key + " (" + d.data.value + ")" })
                                                .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
                                                .style("text-anchor", "middle")
                                                .style("font-size", 17);
                                        }
                                    }

                                    let createBarChart = function (parent, data, color) {

                                        for (let i in data) {
                                            if (data[i] <= 0) {
                                                delete (data[i]);
                                            }
                                        }

                                        if (Object.keys(data).length <= 0) return;

                                        let jqp = $(parent);

                                        if (jqp.length > 0) {

                                            jqp.empty();

                                            let margin = 30;
                                            let width = jqp.width() - 8;
                                            let height = (width / 2) - 2 * margin;
                                            width = width - 2 * margin;

                                            let chart = d3
                                                .select(parent)
                                                .append("svg")
                                                .attr("width", width + 2 * margin)
                                                .attr("height", height + 2 * margin)

                                            let maxY = 0;
                                            let maxX = 0;

                                            for (let t in data) {
                                                let obj = data[t];
                                                if (+obj['numb'] > maxX) maxX = obj['numb'];
                                                if (+obj['count'] > maxY) maxY = obj['count'];
                                            }

                                            let yScale = d3
                                                .scaleLinear()
                                                .range([height, 0])
                                                .domain([0, maxY + 1])
                                                .nice();

                                            chart
                                                .append("g")
                                                .attr('transform', `translate(${margin}, ${margin})`)
                                                .attr("class", "Yaxis")
                                                .call(
                                                    d3
                                                        .axisLeft(yScale)
                                                        .tickFormat(d3.format('.0f'))
                                                        .ticks(maxY + 1)
                                                );

                                            let xScale = d3
                                                .scaleLinear()
                                                .range([0, width])
                                                .domain([0, maxX + 1])
                                                .nice();

                                            chart
                                                .append("g")
                                                .attr("class", "Xaxis")
                                                .attr('transform', `translate(${margin}, ${height + margin})`)
                                                .call(
                                                    d3
                                                        .axisBottom(xScale)
                                                        .tickFormat(d3.format('.0f'))
                                                        .ticks(maxX + 1)
                                                );

                                            let barWidth = (width / maxX) / 2;

                                            chart
                                                .append("g")
                                                .attr('transform', `translate(${margin - barWidth / 2}, ${margin})`)
                                                .attr("class", "bars")
                                                .selectAll()
                                                .data(data)
                                                .enter()
                                                .append('rect')
                                                .style("fill", color)
                                                .attr('x', (s) => xScale(s.numb))
                                                .attr('y', (s) => yScale(s.count))
                                                .attr('height', (s) => height - yScale(s.count))
                                                .attr('width', barWidth);

                                        }
                                        return;
                                    }

                                    let availTime = {};

                                    // get all milestones
                                    if (resolve.users) {
                                        for (let i in resolve.users) {
                                            _this.modStatistics.ptUser++;

                                            let surveyDone = 0;
                                            if (resolve.users[i]['surveyDone'] && +resolve.users[i]['surveyDone']['value'] > 0) {
                                                surveyDone = 1;
                                            }

                                            if (resolve.users[i]['survey']) {
                                                _this.modStatistics.ptSum++;
                                                if (resolve.users[i]['survey']['value']) {
                                                    resolve.users[i]['survey'] = JSON.parse(resolve.users[i]['survey']['value']);
                                                    let surv = resolve.users[i]['survey'];
                                                    switch (surv.objectives) {
                                                        case 'f1a': _this.modStatistics.ptExam++;
                                                            break;
                                                        case 'f1b': _this.modStatistics.ptOrientation++;
                                                            break;
                                                        case 'f1c': _this.modStatistics.ptInterest++;
                                                            break;
                                                        case 'f1d': _this.modStatistics.ptNoAnswer++;
                                                            break;
                                                    }
                                                }
                                                if (resolve.users[i]['survey']['availableTime']) {
                                                    let time = resolve.users[i]['survey']['availableTime'];
                                                    if (availTime[time]) {
                                                        availTime[time]++;
                                                    } else {
                                                        availTime[time] = 1;
                                                    }
                                                }
                                                if (resolve.users[i]['survey']['planingStyle']) {
                                                    let ps = resolve.users[i]['survey']['planingStyle'];
                                                    switch (ps) {
                                                        case 'planing-style-a': _this.modStatistics.ptW1++;
                                                            break;
                                                        case 'planing-style-b': _this.modStatistics.ptW4++;
                                                            break;
                                                        case 'planing-style-c': _this.modStatistics.ptWA++;
                                                            break;
                                                        case 'planing-style-d': _this.modStatistics.ptWA2++;
                                                            break;
                                                        case 'planing-style-e': _this.modStatistics.ptWA4++;
                                                            break;
                                                        case 'planing-style-f': _this.modStatistics.ptWANA++;
                                                            break;
                                                    }
                                                }
                                            }
                                            let milestones = 0;
                                            let msDone = 0;
                                            let msReady = 0;
                                            let msFailed = 0;
                                            if (resolve.users[i]["milestones"] && resolve.users[i]["milestones"]["milestones"]) {
                                                _this.modStatistics.ptMS++;
                                                resolve.users[i]["milestones"] = JSON.parse(resolve.users[i]["milestones"]["milestones"]);
                                                let msCount = resolve.users[i]["milestones"].length;
                                                for (let t in resolve.users[i]["milestones"]) {
                                                    milestones++;
                                                    let ms = resolve.users[i]["milestones"][t];
                                                    switch (ms.status) {
                                                        case 'progress': _this.modStatistics.msProgessed++;
                                                            break;
                                                        case 'ready': _this.modStatistics.msReady++;
                                                            msReady++;
                                                            break;
                                                        case 'urgent': _this.modStatistics.msUrgent++;
                                                            break;
                                                        case 'missed': _this.modStatistics.msMissed++;
                                                            msFailed++;
                                                            break;
                                                        case 'reflected': _this.modStatistics.msReflected++;
                                                            _this.modStatistics.msReady++;
                                                            msDone++;
                                                            break;
                                                    }
                                                }
                                                _this.modStatistics.milestones += msCount;
                                            }

                                            if ($('#stUserList').length > 0) {
                                                $('#stUserList tr:last').after(`<tr><td>${resolve.users[i]['firstname']}</td><td>${resolve.users[i]['lastname']}</td><td>${resolve.users[i]['email']}</td><td>${surveyDone}</td><td>${milestones}</td><td>${msFailed}</td><td>${msReady}</td><td>${msDone}</td></tr>`);
                                            }
                                            //console.log(JSON.parse(resolve.users[i]["milestones"]["milestones"]));
                                            /*
                                            resolve.users[i]["milestones"] = JSON.parse(resolve.users[i]["milestones"]["milestones"]);*/
                                        }

                                        let timeArray = [];

                                        let table = "";

                                        for (let u in availTime) {

                                            table += `<tr><td>${u} SWS</td><td style="padding-right: 30px; text-align: right;">${availTime[u]}</td></tr>`;

                                            timeArray.push(
                                                {
                                                    numb: parseInt(u),
                                                    count: availTime[u]
                                                }
                                            );
                                        }

                                        $('#modWorkload tr:first').after(table);

                                        createBarChart("#stChartHR", timeArray, "#003f5c");

                                        let data = {
                                            "Bearbeitung": _this.modStatistics.msProgessed,
                                            "Dringend": _this.modStatistics.msUrgent,
                                            "Abgeschlossen": _this.modStatistics.msReady,
                                            "Reflektiert": _this.modStatistics.msReflected,
                                            "Abgelaufen": _this.modStatistics.msMissed
                                        };

                                        var color = ["#003f5c", "#ffa600", "#bc5090", "#58508d", "#ff6361"];
                                        createPie("#stChartMS", data, color);

                                        data = {
                                            "Prüfung": _this.modStatistics.ptExam,
                                            "Orientierung": _this.modStatistics.ptOrientation,
                                            "Interesse": _this.modStatistics.ptInterest,
                                            "Keine Angabe": _this.modStatistics.ptNoAnswer
                                        }
                                        createPie("#stChartTA", data, color);

                                        data = {
                                            "Nur eine Woche": _this.modStatistics.ptW1,
                                            "Nur vier Wochen": _this.modStatistics.ptW4,
                                            "Semester eine Woche": _this.modStatistics.ptWA,
                                            "Semester zwei Wochen": _this.modStatistics.ptWA2,
                                            "Semester vier Wochen": _this.modStatistics.ptWA4,
                                            "Keine Angabe": _this.modStatistics.ptWANA
                                        }
                                        createPie("#stChartPS", data, color);

                                        //console.log(resolve.users);
                                    }
                                },
                                (reject) => {
                                    console.log(reject);
                                }
                            )

                        } catch (error) {
                            console.log(error);
                        }
                    },
                    sendNotification: function (subject, text) {
                        /*require(['core/notification'], function(notification) {
                            notification.addNotification({
                              message: "Your message here",
                              type: "info"
                            });
                        });*/

                        try {
                            utils.get_ws("notification", {
                                'courseid': parseInt(course.id, 10),
                                'subject': "hello",
                                'short': "ss",
                                'text': "Hier steht deine Werbung"
                            }, function (u) {
                                console.log(u);
                            });
                        } catch (error) {
                            console.log(error);
                        }


                        /*require(['core/notification'], function(notification) {
                                console.log("LOADED");
                                console.log(typeof notification.addNotification);
                                notification.addNotification({
                                  message: "Your message here",
                                  type: "info"
                                });
                                console.log(typeof notification.fetchNotifications);                                
                            });*/
                    },
                    modUpdateUser: function () {
                        let _this = this;
                        let items = $("input.mru:checked");
                        if (items.length <= 0) {
                            this.modAlert("warning", "Bitte wählen Sie einen Benutzer aus.");
                            return;
                        }
                        let resetMS = $("#modResetUserMS").is(":checked");
                        let resetPlan = $("#modResetUserPlan").is(":checked");
                        if (!resetMS && !resetPlan) {
                            this.modAlert("warning", "Bitte wählen Sie aus, was zurück gesetzt werden soll.");
                            return;
                        }
                        let update = [];
                        items.each(
                            function () {
                                let item = $(this);
                                let val = +item.val();
                                if (typeof val !== "number" && val <= 0) return;
                                let prom = new Promise(
                                    (resolve, reject) => {
                                        let data = {
                                            courseid: parseInt(course.id, 10),
                                            userid: parseInt(val, 10)
                                        };
                                        if (resetMS) data['milestones'] = [];
                                        if (resetPlan) data['plan'] = [];
                                        data = JSON.stringify(data);
                                        utils.get_ws("updateuser", {
                                            'data': data
                                        }, function (u) {
                                            for (let i in _this.modUsers) {
                                                if (_this.modUsers[i]['id'] === val) {
                                                    //console.log(_this.modUsers[i]['id'])
                                                    if (_this.modUsers[i]['self'] === true) {
                                                        //console.log(_this.modUsers[i]['self']);
                                                        return resolve(true);
                                                    } else {
                                                        return resolve(false);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                );
                                update.push(prom);
                            }
                        );
                        Promise.all(update).then(
                            (resolve) => {
                                for (let i in resolve) {
                                    if (resolve[i] === true) location.reload();
                                }
                                this.modAlert("success", "Benutzerplanung zurückgesetzt");
                            },
                            (reject) => {
                                this.modAlert("danger", reject);
                            }
                        )
                        return;
                    },
                    userAutocomplete: async function (target, value) {
                        try {
                            $("input.mru:not(:checked)").parent().remove();
                            let list = $('div.userAutocomplete');
                            if (list.children().length <= 0) {
                                list.removeClass("bg-secondary");
                                list.removeClass("mb-3");
                            }
                            if (typeof value !== "string" || value.length <= 0) return;
                            if (typeof this.modUsers !== "object" || this.modUsers.length < 1) {
                                let result = await new Promise(
                                    (resolve, reject) => {
                                        utils.get_ws("getalluser", {
                                            'courseid': parseInt(course.id, 10)
                                        }, function (u) {
                                            let obj = JSON.parse(u.data);
                                            if (!obj.user) throw new Error("Invalid Return");
                                            return resolve(obj.user);
                                        });
                                    }
                                );
                                this.modUsers = result;
                            }
                            value = value.toLowerCase();
                            for (let i in this.modUsers) {
                                let element = this.modUsers[i];
                                element.id = +element.id;
                                if (typeof element.id !== "number" || element.id < 0) continue;
                                if ($("#mru-" + element.id).length > 0) continue;
                                let ident = "";
                                let found = false;
                                if (element.username) {
                                    if (element.username.toLowerCase().indexOf(value) !== -1) found = true;
                                    ident += ident.length > 0 ? " - " + element.username : element.username;
                                }
                                if (element.name) {
                                    if (element.name.toLowerCase().indexOf(value) !== -1) found = true;
                                    ident += ident.length > 0 ? " - " + element.name : element.name;
                                }
                                if (element.email) {
                                    if (element.email.toLowerCase().indexOf(value) !== -1) found = true;
                                    ident += ident.length > 0 ? " - " + element.email : element.email;
                                }
                                if (found) {
                                    if (list.children().length <= 0) {
                                        list.addClass("bg-secondary");
                                        list.addClass("mb-3");
                                    }
                                    let divElem = $("<div class=\"form-check\"></div>").appendTo(list);
                                    $("<input class=\"mru form-check-input\" type=\"checkbox\" value=\"" + element.id + "\" id=\"mru-" + element.id + "\" />").appendTo(divElem);
                                    $("<label class=\"form-check-label\" for=\"modResetUsers\" />").text(ident).appendTo(divElem);
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    },
                    getMilestonePlan: function () {
                        try {
                            let _this = this;
                            utils.get_ws("userpreferences", {
                                data: {
                                    'setget': 'get',
                                    'courseid': parseInt(course.id, 10),
                                    'fieldname': 'ladtopics_survey_results',
                                }
                            }, function (u) {
                                if (typeof u.response !== "string" || u.response.length <= 0) return;
                                let survey = JSON.parse(u.response);
                                    if (survey[0]["value"] === '0') return;
                                let result = JSON.parse(survey[0]["value"]);
                                let plan = result.objectives.toLowerCase();
                                let ps = result.planingStyle.toLowerCase();
                                let sr = {
                                    from: course.startDate,
                                    to: course.endDate//new Date(end.setDate(end.getDate() + 1 + this.daysOffset)) // had to create new date otherwise it will throw a parse error 
                                };
                                let diff = Math.round((sr.to - sr.from) / (7 * 24 * 60 * 60 * 1000));
                                switch (plan) {
                                    case 'f1a': plan = "exam";
                                        break;
                                    case 'f1b': plan = "orientation";
                                        break;
                                    case 'f1c': plan = "interest";
                                        break;
                                    default: plan = null;
                                }
                                if (typeof plan !== "string" && plan === null) return;
                                utils.get_ws('getmilestoneplan', {
                                    data: {
                                        'courseid': parseInt(course.id, 10),
                                        'plan': plan
                                    }
                                }, function (e) {
                                    try {
                                        if (typeof e.data === "string" && e.data.length > 0) {
                                            let obj = JSON.parse(e.data);
                                            if (typeof obj !== "object" || !Array.isArray(obj)) {
                                                return;
                                            }
                                            let div = null;
                                            switch (ps) {
                                                case "planing-style-a": div = 1;
                                                    break;
                                                case "planing-style-b": div = 4;
                                                    break;
                                                case "planing-style-c": div = 1;
                                                    break;
                                                case "planing-style-d": div = 4;
                                                    break;
                                                case "planing-style-e": return;
                                            }

                                            if (div === 4) {
                                                let span = [];
                                                let last = sr.from.toISOString();
                                                let target = sr.to.toISOString();
                                                last = moment(last).set({ hour: 12 }).toDate();
                                                target = moment(target).set({ hour: 12 }).toDate();
                                                span.push(last);
                                                let next = moment(last).add(div, 'w').toDate();
                                                while (next <= target) {
                                                    span.push(next);
                                                    last = next;
                                                    next = moment(last).add(div, 'w').toDate();
                                                }
                                                obj.forEach(
                                                    function (element) {
                                                        element.start = moment(element.start).toDate();
                                                        element.end = moment(element.end).toDate();
                                                        element.mod = true;
                                                        for (let i in span) {
                                                            if (element.end <= span[i]) {
                                                                if (typeof span[i - 1] !== "undefined") {
                                                                    element.start = span[i - 1];
                                                                } else {
                                                                    element.start = span[i];
                                                                }
                                                                element.end = span[i];
                                                                break;
                                                            }
                                                        }
                                                        let found = false;
                                                        for (let u in _this.milestones) {
                                                            if (_this.milestones[u].id === element.id) {
                                                                found = true;
                                                                break;
                                                            }
                                                        }
                                                        if (!found) _this.milestones.push(element);
                                                    }
                                                );
                                            } else {
                                                obj.forEach(
                                                    function (element) {
                                                        element.start = moment(element.start).toDate();
                                                        element.end = moment(element.end).toDate();
                                                        element.mod = true;

                                                        let found = false;
                                                        for (let u in _this.milestones) {
                                                            if (_this.milestones[u].id === element.id) {
                                                                found = true;
                                                                break;
                                                            }
                                                        }
                                                        if (!found) _this.milestones.push(element);
                                                    }
                                                );
                                            }
                                        }
                                    } catch (error) {
                                        new ErrorHandler(error);
                                    }
                                });
                            }
                            );
                        } catch (error) {
                            new ErrorHandler(error);
                        }
                    }
                }
            });



            var survey = new InitialSurvey(milestoneApp, utils, course);

            /**
             * Resize charte if window sizes change
             */
            window.onresize = function (event) {
                width = document.getElementById('planing-component').offsetWidth;
                milestoneApp.width = width - margins.right;
                //dc.redrawAll(mainGroup);
                milestoneApp.timeFilterChart.filterTime();
            };

        };// end draw
    };// end Timeline

    return Timeline;
});








