/* eslint-disable valid-jsdoc */
/* eslint-disable capitalized-comments */
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
    var Timeline = function (Vue, d3, dc, crossfilter, moment, Sortable, utils, FilterChart, ActivityChart, InitialSurvey) {

        var width = document.getElementById('ladtopic-container-0').offsetWidth;
        var margins = { top: 15, right: 10, bottom: 20, left: 10 };
        var course = {
            id: $('#courseid').text()
            // module: parseInt($('#moduleid').html()) 
        };

        utils.get_ws('logstore', {
            'courseid': parseInt(course.id, 10)
        }, function (e) {
            try {
                draw(JSON.parse(e.data));
            } catch (e) {
                console.error(e);
            }
        });

        /**
         * 
         * @param {*} the_data 
         */
        var draw = function (the_data) {

            var xRange = [new Date(2019, 4, 28), new Date(2020, 231)];

            /*
            http://computationallyendowed.com/blog/2013/01/21/bounded-panning-in-d3.html
            var zoom = d3.behavior.zoom().scaleExtent([1, 1]);
            zoom.on('zoom', function () {
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
                 data: function () {
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
                        surveyDone: false,
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
                        milestones: [
                            {
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
                            }
                        ],
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
                        },
                        invalidName: false,
                        invalidObjective: false,
                        invalidResources: false,
                        invalidStrategy: false,
                        selectedDay: 1,
                        selectedMonth: 1,
                        selectedYear: 2019,
                        dayInvalid: false,
                        filterPreset: '',
                        selectedMilestone: 0,
                        modalVisible: false,
                        reflectionsFormVisisble: false,
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

                            { id: 'flashcards', name: 'Systematisches Wiederholen mit der Lernkartei', desc: 'Mit Lernkarten kann man Dinge systematisch wiederholen bis alles für die Prüfung sitzt. ', url: "http://www.heise.de/", category: 'repeatition' },
                            { id: 'repeatition', name: 'Repetieren', desc: 'Mit vielen Wiederholungen festigt sich das Wissen. ', url: "http://www.heise.de/", category: 'repeatition' },
                            { id: 'assoc', name: 'Eselsbrücken als Erinnerungshilfe', desc: 'Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.', url: "http://www.heise.de/", category: 'repeatition' },
                            { id: 'loci', name: 'Loci Methode', desc: 'Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.', url: "http://www.heise.de/", category: 'repeatition' }

                        ],
                        resources: []
                    };
                },
                mounted: function () {
                    var _this = this;
                    this.range = xRange;
                    // load data from local storage
                    if (localStorage.milestones) {
                        this.milestones = JSON.parse(localStorage.milestones);
                    }
                    if (localStorage.surveyDone) {
                        this.surveyDone = localStorage.surveyDone;
                        if (this.surveyDone) {
                            $('#planing-component').show();
                        } else {
                            //$('.activity-chart-container').hide();
                            //$('.filter-chart-container').hide();
                        }
                    }
                    this.emptyMilestone.end = new Date();
                    this.updateMilestoneStatus();
                    this.initializeChart();
                    /* window.addEventListener('keyup', function (event) {
                        if (event.keyCode === 27 && this.modalVisible) {
                            _this.closeModal();
                        }
                    });*/
                    var facts = crossfilter(the_data);
                    this.timeFilterChart = new FilterChart(d3, dc, crossfilter, facts, xRange, this, utils);
                },
                created: function () {
                    var _this = this;
                    $(document).keyup(function (e) {
                        e.preventDefault();
                        if (e.key === "Escape") { // escape key maps to keycode `27`
                            //_this.closeModal();
                            _this.updateMilestoneStatus();
                            _this.updateChart(this.range);
                        }
                    });
                },
                watch: {
                    milestones: function (newMilestone) {
                        localStorage.milestones = JSON.stringify(newMilestone);
                    },
                    surveyDone: function (surveyStatus) {

                        localStorage.surveyDone = surveyStatus;
                        if (this.surveyDone) {
                            $('.activity-chart-container').show();
                            $('.filter-chart-container').show();
                        } else {
                            //$('.activity-chart-container').hide();
                            //$('.filter-chart-container').hide();
                        }
                    }/*,
                    modalVisible: function (flag) {
                        if (flag === false) {
                            this.closeModal();
                        }

                    }*/
                },
                methods: {
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
                                console.log('Ladezeit', t1 - (new Date()).getTime());
                                console.log('course-structure-result', _this.resources.map(function(e){ return e.id; }));
                                //console.log('debug', JSON.parse(e.debug));
                            } catch (e) {
                                console.error(e);
                            }
                        });
                        this.margins = margins;
                        this.width = width;
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

                        // Tooltip
                        /* var tip = d3.tip()
                            .attr('class', 'd3-tip').direction('se').offset([-10, 0])
                            .html(function (d, i) { return arr = [ "n: " + i, "Group: " + d.g ].join('<br>'); });
                        */

                        // Adds the svg canvas
                        this.chart = d3.select('.chart.ms-chart .milestone-chart-container svg g');

                        // Add the Axis
                        this.x_axis_call = this.chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").call(this.xAxis);
                        this.y_axis_call = this.chart.append("g").attr("class", "y axis").call(this.yAxis);
                        //this.x = x;
                        //this.y = y;
                        this.updateChart(this.range);

                        //xxx dc.registerChart(this.chart, activityChart.getGroup());
                        //this.timeFilterChart = timeFilterChart; 

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
                        console.log('range', this.range)
                        var x_ = d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding])(x);
                        return x_;
                    },
                    /*y_: function () {
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
                    },
                    closeModal: function (e) {
                        this.modalVisible = false;
                        this.updateMilestoneStatus();
                        this.updateChart(this.range);
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
                        this.modalVisible = true;
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
                            }
                        }
                    },
                    addMilestone: function (ms) {
                        console.log('addMS ', ms.end);
                        ms.end = new Date(ms.end);
                        ms.start = new Date(ms.start);
                        this.milestones.push(ms);
                        this.updateMilestoneStatus();
                        this.updateChart(this.range);
                        this.$forceUpdate();
                        console.log(this.milestones);
                    },
                    createMilestone: function (e) {
                        this.emptyMilestone.id = Math.ceil(Math.random() * 1000);
                        this.emptyMilestone.end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay, 12);
                        var d = new Date();
                        this.emptyMilestone.start = new Date(d.getFullYear() + '/' + (d.getMonth()) + '/' + d.getDate());

                        this.milestones.push(this.emptyMilestone);
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
                    removeMilestone: function () {
                        this.closeModal();
                        $('div.modal-backdrop.show').remove();
                        for (var s = 0; s < this.milestones.length; s++) {
                            if (this.milestones[s].id === this.selectedMilestone) {
                                this.milestones.splice(s, 1);
                                this.selectedMilestone = -1;
                            }
                        }
                    },
                    daySelected: function (event, d) {
                        var day = event ? parseInt(event.target.value) : d;
                        console.log('day:' + day, 'mon:' + this.selectedMonth, [4, 6, 9, 11].indexOf(parseInt(this.selectedMonth), 10) !== -1, day === 31)
                        if ([4, 6, 9, 11].indexOf(parseInt(this.selectedMonth, 10)) !== -1 && parseInt(day, 10) === 31) {
                            this.dayInvalid = true;
                            this.selectedMonth++;
                            return;
                        } else if (parseInt(this.selectedMonth, 10) === 2 && day > 29) {
                            this.dayInvalid = true;
                            return;
                        } else if (parseInt(this.selectedMonth, 10) === 2 && day === 29 && !(parseInt(this.selectedYear, 10) % 4 === 0 && parseInt(this.selectedYear, 10) % 100 !== 0 || parseInt(this.selectedYear, 10) % 400 === 0)) {
                            this.dayInvalid = true;
                            return;
                        } else {
                            this.dayInvalid = false;
                        }
                        this.selectedDay = day;

                        if (this.dayInvalid === false) {
                            this.getSelectedMilestone().end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
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
                        this.getSelectedMilestone().end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
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
                    strategiesByCategory: function (cat) {
                        return this.strategies.filter(function (s) {
                            return s.category === cat ? true : false;
                        });
                    },
                    strategyById: function (id) {
                        return this.strategies.filter(function (s) {
                            return s.id === id ? true : false;
                        })[0];
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
                        return this.resources.filter(function (s) {
                            return parseInt(s.id, 10) === parseInt(id, 10) ? true : false;
                        })[0];
                    },
                    strategySelected: function (event) {
                        var el = this.strategyById(event.target.value);
                        if (this.getSelectedMilestone().strategies.indexOf(el) === -1) {
                            this.getSelectedMilestone().strategies.push(el);
                        }
                        this.invalidStrategy = this.getSelectedMilestone().strategies.length > 0 ? false : true;
                        localStorage.milestones = JSON.stringify(this.milestones);
                    },
                    strategyRemove: function (id) {
                        for (var s = 0; s < this.getSelectedMilestone().strategies.length; s++) {
                            if (this.getSelectedMilestone().strategies[s].id === id) {
                                this.getSelectedMilestone().strategies.splice(s, 1);
                            }
                        }
                        this.invalidStrategy = this.getSelectedMilestone().strategies.length > 0 ? false : true;
                        localStorage.milestones = JSON.stringify(this.milestones);
                    },
                    resourceSelected: function (event) {
                        var el = this.resourceById(event.target.value);
                        if (this.getSelectedMilestone().resources.indexOf(el) === -1) {
                            this.getSelectedMilestone().resources.push(el);
                        }
                        this.invalidResources = this.getSelectedMilestone().resources.length > 0 ? false : true;
                        localStorage.milestones = JSON.stringify(this.milestones);
                    },
                    resourceRemove: function (id) {
                        for (var s = 0; s < this.getSelectedMilestone().resources.length; s++) {
                            if (this.getSelectedMilestone().resources[s].id === id) {
                                this.getSelectedMilestone().resources.splice(s, 1);
                            }
                        }
                        this.invalidResources = this.getSelectedMilestone().resources.length > 0 ? false : true;
                        localStorage.milestones = JSON.stringify(this.milestones);
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

                        //if (milestone.resources.length === 0) {
                        //return 0;
                        //}

                        resourceProgress = milestone.resources.filter(function (e) {
                            return e.checked === true ? true : false;
                        }).length / milestone.resources.length;

                        strategiesProgress = milestone.strategies.filter(function (e) {
                            return e.checked === true ? true : false;
                        }).length / milestone.strategies.length;

                        return ((resourceProgress + strategiesProgress) / 2);
                    },
                    updateMilestoneStatus: function () {
                        var t = new Date();
                        for (var i = 0; i < this.milestones.length; i++) {
                            var diff = moment(t).diff(moment(this.milestones[i].end), 'days');

                            this.milestones[i].status = 'progress';

                            // update progress
                            this.milestones[i].progress = this.determineMilestoneProgress(this.milestones[i]);

                            if (diff < 3 && this.milestones[i].progress !== 1) {
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
                    },
                    hightlightSelectedResources: function () {
                        for (var j = 0; j < this.milestones.length; j++) {
                            for (var i = 0; i < this.milestones[j].resources.length; i++) {
                                console.log('selected module-ids: ', this.milestones[j].resources[i].instance_url_id)
                                $('#module-' + this.milestones[j].resources[i].instance_url_id)
                                    .removeClass('resource-highlight')
                                    .removeClass('resource-highlight-done')
                                    .addClass(this.milestones[j].resources[i].checked ? 'resource-highlight-done' : 'resource-highlight')
                                    .attr('title', this.milestones[j].resources[i].checked ? 'Dieses Element haben Sie bereits als "erledigt" markiert.' : 'Dieses Element haben Sie zur Bearbeitung in einem Meilenstein ausgewählt.')
                                    .attr('data-toggle', 'tooltip')
                                    ;
                            }
                        }
                    },
                    toggleReflectionsForm: function () {
                        this.reflectionsFormVisisble = !this.reflectionsFormVisisble; console.log(this.reflectionsFormVisisble)
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
                    },
                    setFilterPreset: function (preset) {
                        var range = [];
                        var now = new Date();
                        this.filterPreset = preset;
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
                    }
                }
            });
            milestoneApp.setFilterPreset('semester');


            var survey = new InitialSurvey(Vue, Sortable, milestoneApp, utils, course);
            var activityChart = new ActivityChart(d3, dc, crossfilter, moment, the_data, utils);
            xRange = activityChart.getXRange();
            milestoneApp.timeFilterChart.registerChart(activityChart);

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








