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
    'core/ajax'
], function ($, ajax) {


    /**
     * Plot a timeline
     */
    var Timeline = function (Vue, d3, dc, crossfilter, moment, Sortable, utils, introJs, logger, FilterChart, ActivityChart, InitialSurvey, ICalExport, ICalLib) {
        var width = document.getElementById('ladtopic-container-0').offsetWidth;
        var margins = { top: 15, right: 10, bottom: 20, left: 10 };
        var course = {
            id: parseInt($('#courseid').text(), 10)
            // module: parseInt($('#moduleid').html()) 
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
         * @param {*} the_data 
         */
        var draw = function (the_data, logger) {

            var xRange = [new Date(2019, 4, 28), new Date(2020, 231)];

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
                    // 'survey': surveyForm
                },
                data: function () {
                    return {
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
                        /*  [{
                              id: 3867650,
                              name: 'Planung',
                              objective: 'Mein Semester planen',
                              start: '2019,9,1',
                              end: '2019,10,1',
                              status: 'urgent',
                              progress: 1.00,
                              resources: [],
                              strategies: [],
                              reflections: [],
                          },
                          {
                              id: 0,
                              name: 'Lesen',
                              objective: 'Die Kurstexte lesen',
                              start: '2019,9,1',
                              end: '2019,9,7',
                              status: 'urgent',
                              progress: 1.00,
                              resources: [],
                              strategies: [],
                              reflections: [],
                          },
                          {
                              id: 1,
                              name: 'Tests',
                              objective: 'Alle Tests bestehen',
                              start: '2020,1,15',
                              end: '2020,2,15',
                              status: 'progress', // progress, ready, urgent, missed, reflected
                              progress: 0.80,
                              resources: [],
                              strategies: [],
                              reflections: [],
                          }]*/

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
                            reflections: []
                        },
                        invalidName: false,
                        invalidObjective: false,
                        invalidResources: false,
                        invalidStrategy: false,
                        invalidEndDate: false,
                        selectedDay: 1,
                        selectedMonth: 1,
                        selectedYear: 2019,
                        invalidDay: false,
                        filterPreset: '',
                        selectedMilestone: 0,
                        modalVisible: false,
                        modalReflectionVisible: false,
                        reflectionsFormVisisble: false,
                        strategyCategories: [
                            { id: 'organization', name: 'Organisation' },
                            { id: 'elaboration', name: 'Elaborationsstrategien' },
                            { id: 'repeatition', name: 'Wiederholungsstrategien' },
                            { id: 'misc', name: 'Sonstige' }

                        ],
                        strategies: [ // Übertrage Ansätze auf Kontexte ?? #86
                            { id: 'reading', name: 'Überblick durch Lesen/Querlesen', desc: 'Durch schnelles Querlesen verschaffen Sie sich einen Überblick über das Themengebiet. Schauen Sie sich doch auch einmal die PQ4R-Methode an.', url: "", category: 'organization' },
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
                        if (e !== null) {
                            var data = JSON.parse(e.milestones);

                            if (!data || !data.milestones) {
                                _this.milestones = [];
                            } else {
                                // todo: A validation of the JSON should be feasible
                                _this.milestones = JSON.parse(data.milestones);
                                _this.sortMilestones();
                                _this.emptyMilestone.end = new Date();
                                _this.updateMilestoneStatus();
                                _this.initializeChart();

                                var facts = crossfilter(the_data);
                                _this.timeFilterChart = new FilterChart(d3, dc, crossfilter, facts, xRange, _this, utils, logger);

                                _this.setFilterPreset('semester');
                                var activityChart = new ActivityChart(d3, dc, crossfilter, moment, the_data, utils);
                                xRange = activityChart.getXRange();
                                _this.timeFilterChart.registerChart(activityChart);

                                logger.add('planing_tool_open', { pageLoaded: true });
                            }
                        }
                    });

                    /* window.addEventListener('keyup', function(event) {
                        if (event.keyCode === 27 && this.modalVisible) {
                            _this.closeModal();
                        }
                    });*/

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
                    }
                },
                methods: {
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
                                        intro: 'Der grüne Balken drückt aus, wie weit die Bearbeitung schon fortgeschritten ist. Sind alle Materialien abgearbeitet werden sie abgehakt, die Lernstrategien müssen durch abhaken bestätigt werden oder können gelöscht werden, wenn sie nicht genutzt wurden. Ist der Meilenstein erledigt, dann ist es Zeit für die Reflexion. Sie hilft Ihnen zu überlegen, was gut geklappt hat und was Sie ggf. besser machen könnten. Mit der Beantwortung der letzten Frage können Sie einen persönlichen Lernhinweis festhalten, damit Sie die nächste Lernsession noch besser gestalten. Das gilt ganz besonders dann, wenn es einmal mit der Zielerreichung nicht so ganz geklappt hat. Wir lernen auch durch Fehler.',
                                        position: 'top',
                                        step: 7
                                    },
                                    /* Milestone timeline chart */
                                    {
                                        element: document.querySelector('#milestone-timeline-tab'),
                                        intro: 'Sie können sich die Meilensteine auch als Zeitleiste anzeigen lassen.',
                                        position: 'top',
                                        step: 7
                                    },
                                    {
                                        element: document.querySelector('.milestone-chart-container'),
                                        intro: 'In der oberen Zeitleiste werden Meilensteine dargestellt.',
                                        position: 'top',
                                        step: 8
                                    },
                                    {
                                        element: document.querySelector('.activity-chart-container'),
                                        intro: 'Im mittleren Teil sehen Sie, in welchen Bereichen Sie im Kurs bereits aktiv waren. Auf der X-Achse ist die Zeit abgebildet. Die Größe der Punkte zeigt Ihnen an, wie aktiv Sie waren.',
                                        position: 'top',
                                        step: 9
                                    },
                                    {
                                        element: document.querySelector('.filter-chart-container'),
                                        intro: 'Diese Zeitleiste umfasst das gesamte Semester und ermöglicht Ihnen, den Betrachtungszeitraum der oberen Zeitleisten durch die äußeren Schieber auf Stunden, Tage oder Wochen zu begrenzen.',
                                        position: 'top',
                                        step: 10
                                    },
                                    {
                                        element: document.querySelector('.time-filters'),
                                        intro: 'Hier können Sie auch noch weitere Filter nutzen.',
                                        position: 'top',
                                        step: 11
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
                        this.selectedYear = 2019; // (new Date()).getFullYear();
                        // obtain course structure form DB
                        var t1 = new Date().getTime();
                        utils.get_ws('coursestructure', {
                            courseid: parseInt(course.id, 10)
                        }, function (e) {
                            try {
                                _this.resources = JSON.parse(e.data);
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
                    /*x_: function() {
                        return d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding]); // 
                    },*/
                    xx: function (x) {
                        //console.log('range', this.range)
                        var x_ = d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding])(x);
                        return x_;
                    },
                    /*y_: function() {
                        return d3.scaleLinear()
                            .domain([0, this.ymax])
                            .range([0, this.height]);
                    },*/
                    z: function () {
                        return d3.scaleOrdinal()
                            .range(this.colors);
                    },
                    getYLane: function (id) {
                        return id % 3;
                    },
                    updateChart: function (range) {
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
                    showModal: function (e) {
                        this.selectedMilestone = e;
                        this.reflectionsFormVisisble = this.getSelectedMilestone().status === 'reflected' ? true : false;
                        this.modalVisible = true;
                        if (e > 0) {
                            logger.add('milestone_edit_dialog_open', {
                                milestoneId: this.getSelectedMilestone().id,
                                name: this.getSelectedMilestone().name,
                                start: this.getSelectedMilestone().start.getTime(),
                                end: this.getSelectedMilestone().end.getTime(),
                                status: this.getSelectedMilestone().status,
                                objective: this.getSelectedMilestone().objective,
                                resources: this.getSelectedMilestone().resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                                strategies: this.getSelectedMilestone().strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                            });
                        }
                    },
                    closeModal: function (e) {
                        this.modalVisible = false;
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
                            start: this.getSelectedMilestone().start.getTime(),
                            end: this.getSelectedMilestone().end.getTime(),
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
                        this.selectedDay = t.getDate();
                        this.selectedMonth = t.getMonth() + 1;
                        this.selectedYear = t.getFullYear();
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
                                this.createMilestone();
                            } else {
                                $('#theMilestoneModal').modal('hide');
                                this.updateMilestoneStatus();
                                logger.add('milestone_updated', {
                                    milestoneId: this.getSelectedMilestone().id,
                                    name: this.getSelectedMilestone().name,
                                    start: this.getSelectedMilestone().start.getTime(),
                                    end: this.getSelectedMilestone().end.getTime(),
                                    status: this.getSelectedMilestone().status,
                                    objective: this.getSelectedMilestone().objective,
                                    resources: this.getSelectedMilestone().resources.map(function (resource) { return { name: resource.instance_title, section: resource.section, type: resource.instance_type, done: resource.checked !== undefined ? true : false }; }),
                                    strategies: this.getSelectedMilestone().strategies.map(function (strategy) { return { name: strategy.id, done: strategy.checked !== undefined ? true : false }; })
                                });

                            }
                        }
                    },
                    createMilestone: function (e) {
                        this.emptyMilestone.id = Math.ceil(Math.random() * 1000);
                        this.emptyMilestone.end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay, 12);
                        var d = new Date();
                        this.emptyMilestone.start = new Date();

                        this.milestones.push(this.emptyMilestone);
                        logger.add('milestone_created', {
                            milestoneId: this.emptyMilestone.id,
                            name: this.emptyMilestone.name,
                            start: this.emptyMilestone.start.getTime(),
                            end: this.emptyMilestone.end.getTime(),
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
                            reflections: []
                        };
                        $('#theMilestoneModal').modal('hide');
                    },
                    addMilestones: function (milestones) {
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
                        this.closeModal();
                        $('div.modal-backdrop.show').remove();
                        logger.add('milestone_removed', {
                            milestoneId: this.getSelectedMilestone().id,
                            name: this.getSelectedMilestone().name,
                            start: this.getSelectedMilestone().start.getTime(),
                            end: this.getSelectedMilestone().end.getTime(),
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
                    },
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
                        var endDate = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
                        // Prohobit end dates before the semester start
                        if (
                            moment(endDate).diff(moment(new Date(2019, 8, 30, 23, 59)), 'minutes') > 0 &&
                            moment(endDate).diff(moment(new Date()), 'years') < 1
                            ) {
                            this.invalidEndDate = false;
                            this.getSelectedMilestone().end = endDate;
                        } else {
                            this.invalidEndDate = true;
                        }
                    },
                    dayRange: function () {
                        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
                    },
                    monthRange: function () {
                        return utils.monthRange;
                    },
                    yearRange: function () {
                        return [2019, 2020]; // xxx should become a plugin setting
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
                            //if (this.resources[i].section_name === ' ')
                            // console.log(this.resources[i].section_id + '__' + this.resources[i].section_name + '__' + this.resources[i].name)
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
                    limitTextLength: function (str, max) {
                        var len = str.length;
                        if (len > max) {
                            return str.substr(0, max - 4) + '..' + str.substr(len - 4, len);
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
                        // Update Milestones to the database using the webservice
                        var _this = this;
                        utils.get_ws('setmilestones', {
                            data: {
                                'courseid': parseInt(course.id, 10),
                                'milestones': JSON.stringify(_this.milestones),
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
                            console.log('remove');
                            $(this).remove();
                        });
                        for (var j = 0; j < this.milestones.length; j++) {
                            for (var i = 0; i < this.milestones[j].resources.length; i++) {
                                badge = $('<span></span>')
                                    .text(this.limitTextLength(this.milestones[j].name, 14))
                                    .addClass('badge badge-secondary badge-ms')
                                    .attr('data-toggle', 'tooltip')
                                    ;

                                if (!this.milestones[j].resources[i].checked && this.milestones[j].status === 'missed') {
                                    badge
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" noch nicht erledigt oder als "erledigt" markiert.')
                                        .addClass('badge-missed')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                if (!this.milestones[j].resources[i].checked && this.milestones[j].status === 'progress') {
                                    badge
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" noch nicht erledigt oder als "erledigt" markiert.')
                                        .addClass('badge-progress')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                if (!this.milestones[j].resources[i].checked && this.milestones[j].status === 'urgent') {
                                    badge
                                        .attr('title', 'Dieses Element haben Sie im Meilenstein \"' + this.milestones[j].name + '\" noch nicht erledigt oder als "erledigt" markiert.')
                                        .addClass('badge-urgent')
                                        ;
                                    $('#module-' + this.milestones[j].resources[i].instance_url_id + ' div.activityinstance').append(badge);
                                }

                                if (this.milestones[j].resources[i].checked) {
                                    badge
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
                        var valid = true;
                        var r = this.getSelectedMilestone().reflections;
                        for (var i = 0; i < r.length; i++) {
                            if (r[i].length === 0) {
                                valid = false;
                            }
                        }
                        return r.length === 4 ? valid : false;
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
                                range = [new Date(2019, 9, 1, 0, 0, 0, 0), new Date(2020, 2, 31, 23, 59, 59, 0)];
                        }
                        this.timeFilterChart.replaceFilter(dc.filters.RangedFilter(range[0], range[1]));
                        this.timeFilterChart.filterTime();
                    },
                    sortMilestones: function(){                        
                        this.milestones.sort(
                            function(a,b) {
                                let x = new Date(a.end);
                                let y = new Date(b.end);
                                let now = new Date();                           
                                if(a.status === 'progress' && b.status !== "progress") return -1;  
                                if(x-now >= 0 && y-now < 0) return -1;                           
                                return y - x;
                            }
                        )                                  
                    },
                    toICal: function(link){
                        try{
                            // Initialize the calendar
                            let config =  {
                                prodid: "APLE",
                                domain: "APLE",
                                tzid: "Europe/Berlin",
                                type: "Gregorian",
                                version: "2.0"
                            }                           
                            let cal = new ICalExport(ICalLib, config);
                            // Register all Milestones
                            if(this.milestones && this.milestones.length > 0){
                                this.milestones.forEach(
                                    (milestone) => {
                                        try{
                                            let initDate = new Date(milestone.end.toISOString());
                                            initDate.setHours(12);
                                            initDate.setMinutes(0);
                                            initDate.setSeconds(0);
                                            let data = {
                                                uid: milestone.id,
                                                title: milestone.name,
                                                start: initDate                                              
                                            }
                                            // Generate description
                                            let description = milestone.objective ? "Lernziel: "+milestone.objective : "";                                            
                                            if(milestone.resources && milestone.resources.length > 0){
                                                description += "\n\nZu diesem Meilenstein gehören folgende Lernressourcen:";
                                                milestone.resources.forEach(
                                                    (resource) => {      
                                                        let done = resources.checked ? "[erledigt] " : "";        
                                                        if(resources.instance_title) description += "\n- "+done+resources.instance_title;                                                        
                                                    }
                                                )
                                            }
                                            if(milestone.strategies && milestone.strategies.length > 0){                                                
                                                description += "\n\nZu diesem Meilenstein gehören folgende Lernstrategien:";
                                                milestone.strategies.forEach(
                                                    (strategie) => {      
                                                        let done = strategie.checked ? "[erledigt] " : "";        
                                                        if(strategie.name) description += "\n- "+done+strategie.name;                                                        
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
                                                description: "Der Meilenstein "+data.title+" ist fast erreicht!"
                                            });
                                            // Set an alarm one week before end.
                                            date.setDate(date.getDate() - 4);
                                            cal.addAlarm(event, {
                                                type: 0, 
                                                title: data.title,
                                                date: date,
                                                description: "Der Meilenstein "+data.title+" rückt näher!"
                                            });
                                        } catch(error){
                                            console.log("ICalExport: Konnte Event nicht registrieren! \r\n"+error.toString());
                                        }
                                    }
                                );
                            }                               
                            window.open("data:text/calendar;charset=utf-8,"+escape(cal.print()));                           
                        } catch(error){
                            console.log("ICalExport: Konnte den Export nicht erfolgreich abschließen! \r\n "+error.toString());
                        }
                    }
                }
            });


            var survey = new InitialSurvey(Vue, Sortable, milestoneApp, utils, course);

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








