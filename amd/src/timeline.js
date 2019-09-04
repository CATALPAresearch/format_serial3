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
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    let Timeline = function (Vue, d3, dc, crossfilter, moment, sortable, bselect, utils) {

        //const vuemilestone = new Milestones(d3);

        const color_range = ['#004C97', '#004C97', '#004C97', '#004C97', '#004C97', '#004C97', '#004C97']//['yellow', 'blue', 'purple', 'red', 'orange', 'green', 'black'];
        const color_ms_status_range = ["#ffa500", "ff420e", "#80bd9e", "#89da59", "#004C97"];
        //["#ffa500", "#ff0000", "#008000", "#008000", "#0000ff"];
        const label = {
            'mod_forum': 'Forum',
            'mod_glossary': 'Glossar',
            'mod_wiki': 'Wiki',
            'mod_assignment': 'Aufgabe',
            'mod_studentquiz': 'StudentQuiz',
            'mod_quiz': 'Quiz'
        };
        let action_types = Object.keys(label); //['mod_glossary', 'mod_forum', 'mod_wiki'];
        const activity_types = { 'viewed': 'betrachtet', 'updates': 'bearbeitet', 'deleleted': 'gelöscht', 'created': 'erstellt' };
        let width = document.getElementById('dc-chart').offsetWidth;
        const margins = { top: 15, right: 10, bottom: 20, left: 10 };
        const course = {
            id: $('#courseid').text()/*,
            module: parseInt($('#moduleid').html())*/
        };
        console.log(course.id)


        utils.get_ws('logstore', {
            'courseid': parseInt(course.id, 10)
        }, function (e) {
            try {
                //console.log('Data:', JSON.parse(e.data));
                //console.log('User:', JSON.parse(e.user));
                draw(JSON.parse(e.data));
            } catch (e) {
                console.error(e);
            }
        });




        let draw = function (the_data) {

            const locale = d3.timeFormatLocale({
                "decimal": ",",
                "thousands": ".",
                "grouping": [3],
                "currency": ["€", ""],
                "dateTime": "%a %b %e %X %Y",
                "date": "%d.%m.%Y",
                "time": "%H:%M:%S",
                "periods": ["AM", "PM"],
                "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                "months": ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                "shortMonths": ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
            });

            let formatMillisecond = locale.format(".%L"),
                formatSecond = locale.format(":%S"),
                formatMinute = locale.format("%I:%M"),
                formatHour = locale.format("%H:%M"),
                formatDay = locale.format("%a %e.%m."),
                formatDate = locale.format("%d.%m.%Y"),
                formatDate2 = locale.format("%d/%m/%Y"),
                formatWeek = locale.format("%b %d"),
                formatWeekNum = locale.format("%U"),
                formatMonth = locale.format("%B"),
                formatYear = locale.format("%Y");


            function multiFormat(date) {
                return (d3.timeSecond(date) < date ? formatMillisecond
                    : d3.timeMinute(date) < date ? formatSecond
                        : d3.timeHour(date) < date ? formatMinute
                            : d3.timeDay(date) < date ? formatHour
                                : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
                                    : d3.timeYear(date) < date ? formatMonth
                                        : formatYear)(date);
            }


            the_data.forEach(function (d, i) {
                //d.date = dateTimeFormat((new Date(d.utc * 1000)).toLocaleDateString());
                d.date = new Date(d.utc * 1000);
                //d.month = d3.timeMnth(new Date(d.utc * 1000));
                d.action_type = action_types.indexOf(d.action_type);
            });

            // charts
            const chart = dc.bubbleChart("#timeline-chart");
            const timeFilterChart = dc.compositeChart("#filter-chart");

            const facts = crossfilter(the_data);

            let mainDimension = facts.dimension(function (d) {
                return [d.date, d.action_type, d.action];
            });
            let mainGroup = mainDimension.group().reduce(
                /* callback for when data is added to the current filter results */
                function (p, v) {
                    ++p.count;
                    p.date = v.date;
                    p.action = v.action;
                    p.action_type = v.action_type;
                    return p;
                },
                /* callback for when data is removed from the current filter results */
                function (p, v) {
                    --p.count;
                    p.date = v.date;
                    p.action = v.action;
                    p.action_type = v.action_type;
                    return p;
                },
                // init filter 
                function () {
                    return { count: 0, date: 0, action: '', action_type: '' };
                });

            let xRange = [
                d3.min(mainGroup.all(), function (d) { return d.key[0]; }),
                d3.max(mainGroup.all(), function (d) { return d.key[0]; })
            ];
            xRange[1] = moment(xRange[1]).isSameOrBefore(new Date()) ? new Date() : xRange[1];
            console.log(xRange);

            const maxRadius = d3.max(mainGroup.all(), function (d) { return d.value.count; });

            let colorBand = d3.scaleOrdinal().domain(action_types).range(color_range);
            let aa = [];
            for (let i = 0; i < the_data.length; i++) {
                aa.push(the_data[i].action_type);
            }
            let countActionTypes = aa.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            }).length;

            chart
                .width(width)
                .height(20 * countActionTypes)
                .margins({ top: 10, bottom: 20, left: margins.left, right: margins.right })
                .clipPadding(65)
                .renderLabel(false)
                .minRadius(1)
                //.r([0,4])
                .maxBubbleRelativeSize(0.3)
                .x(d3.scaleTime().domain(xRange).range([0, width]))
                //.y(d3.scale.ordinal().range([0,3]))
                .brushOn(true)
                .dimension(mainDimension)
                .group(mainGroup)
                .renderHorizontalGridLines(true)
                .keyAccessor(function (p) {
                    return p.value.date;
                })
                .valueAccessor(function (p) {
                    return p.value.action_type;
                })
                .radiusValueAccessor(function (p) {
                    return p.value.count / maxRadius;
                })
                //.colorAccessor(function (kv) { return kv.value.action_type; })
                .colors(colorBand)
                .title(function (p) {
                    return [
                        "Am " + formatDate(p.value.date),
                        " haben Sie " + utils.numberToWord(p.value.count, 'mal'),
                        " das " + label[action_types[p.value.action_type]],
                        " " + activity_types[p.value.action]
                    ].join("");
                })
                .xAxis(d3.axisBottom().ticks(10))
                ;

            chart.selectAll('.axis.y .tick').attr('transform', "translate(50,0)");

            chart.on('pretransition', function () {
                //chart.select('g.x').attr('transform', 'translate(0,0)');
                chart.selectAll('line.grid-line').attr('y2', chart.effectiveHeight());
            });
            chart
                .elasticY(true)
                .yAxisPadding(0) // for values greater 0 the second tick label disappears
                .yAxis()
                .ticks(countActionTypes)
                .tickFormat(function (d) {
                    if (d === Math.ceil(d)) {
                        return label[action_types[d]];
                    }
                });

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

            /* let modal = Vue.component('modal', {
                 template: '#modalMilestone',
                 props: ['data'],
                 data: function () {
                     return {
                         
                     };
                 }
             });*/

            let surveyForm = new Vue({
                el: '#planningsurvey',
                data: function () {
                    return {
                        modalSurveyVisible: false,
                        objectives: '',
                        availableTime: 0,
                        selectedMonth: 0,
                        selectedYear: 0,
                        resources: [],
                        availableResources: [],
                    };
                },
                mounted: function () {
                    // obtain course structure form DB
                    let _this = this;
                    utils.get_ws('coursestructure', {
                        courseid: parseInt(course.id, 10)
                    }, function (e) {
                        try {
                            //let r = JSON.parse(e.data);

                            _this.availableResources = JSON.parse(e.data);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                },
                methods: {
                    showModal: function (e) {
                        this.modalSurveyVisible = true;
                    },
                    closeModal: function (e) {
                        this.modalSurveyVisible = false;
                    },
                    monthRange: function () {
                        return [...Array(13).keys()].slice(1, 13);
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
                        const el = document.getElementById('selected_resources');
                        let sor = sortable.create(el, {});
                    },
                    resourceRemove: function (id) {
                        for (let s = 0; s < this.resources.length; s++) {
                            if (this.resources[s].id === id) {
                                this.resources.splice(s, 1);
                            }
                        }
                    },
                    updateObjective: function (e) {
                        console.log('lklll ', e.target)
                        this.objectives = e.target.value;
                    },
                    saveSurvey: function () {
                        const today = new Date();
                        let milestones = [];
                        const milestoneTemplate = {};
                        let ms = {};

                        // generate milestones automatically
                        switch (this.objective) {
                            case 'f1a': // wants examination
                                ms = Object.assign({}, milestoneTemplate, {});
                                ms.name = "Prüfung / Klausur";
                                if (this.selectedMonth !== today.getMonth() && this.selectedYear !== today.getFullYear()) {
                                    ms.end = new Date(0, this.selectedMonth, this.selectedYear);
                                } else {
                                    ms.end = new Date(0, 2, 2020); // last montg of the semester as default
                                }
                                milestones.push(ms);
                                break;
                            case 'f1b': // wants orientation
                                break;
                            case 'f1c': // wants certain topics
                                break;
                            case 'f1d': // doesn't want anything
                                break;
                        }
                        milestoneApp.milestones.concat(milestones);
                        // set survey as done
                        milestoneApp.survey = true;
                        $('.ms-chart').show(); // xxx bad jquery hack
                        $('.survey-btn').hide();
                    }
                }
            });
            $('.ms-chart').hide(); // xxx bad jquery hack
            $('.ms-chart').show(); // xxx bad jquery hack
            $('.survey-btn').hide();

            let milestoneApp = new Vue({
                el: '#milestone-chart',
                components: {
                    // 'survey': surveyForm
                },
                data: function () {
                    return {
                        survey: true,
                        chart: '',
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
                        ymax: 0,
                        done:[],
                        range: [],
                        milestones: [
                            {
                                id: 0,
                                name: 'Meilenstein 1',
                                objective: 'Alles lernen',
                                start: '05/31/2019',
                                end: '06/01/2019',
                                status: 'urgent',
                                progress: 1.00,
                                resources: [],
                                strategies: [],
                                reflections: [],
                            },
                            {
                                id: 1,
                                name: 'Meilenstein 2',
                                objective: 'Mehr lernen',
                                start: '06/01/2019',
                                end: '06/02/2019',
                                status: 'progress', // progress, ready, urgent, missed, reflected
                                progress: 0.80,
                                resources: [],
                                strategies: [],
                                reflections: [],
                            }/*,
                            {
                                id: 2,
                                name: 'Meilenstein 3',
                                objective: 'Mehr lernen',
                                start: '06/01/2019',
                                end: '06/02/2019',
                                status: 'progress', // progress, ready, urgent, missed, reflected
                                progress: 0.80,
                                resources: [],
                                strategies: [],
                                reflections: [],
                            },
                            {
                                id: 3,
                                name: 'Meilenstein 4',
                                objective: 'Mehr lernen',
                                start: '06/01/2019',
                                end: '06/02/2019',
                                status: 'progress', // progress, ready, urgent, missed, reflected
                                progress: 0.80,
                                resources: [],
                                strategies: [],
                                reflections: [],
                            }*/
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
                        selectedDay: 1,
                        selectedMonth: 1,
                        selectedYear: 2019,
                        dayInvalid: false,
                        selectedMilestone: 0,
                        modalVisible: false,
                        reflectionsFormVisisble: false,
                        strategies: [
                            { id: 'mindmap', name: 'Mindmap', desc:'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "http://www.heise.de/", category: 'organization' },
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
                    let _this = this;
                    this.emptyMilestone.end = new Date();
                    this.updateMilestoneStatus();
                    this.initializeChart();
                    window.addEventListener('keyup', function (event) {
                        if (event.keyCode === 27 && this.modalVisible) {
                            _this.closeModal();
                        }
                    });
                },
                methods: {
                    getMoodlePath: function () {
                        return M.cfg.wwwroot;
                    },
                    initializeChart: function () {
                        let _this = this;
                        this.range = xRange;
                        this.selectedDay = (new Date()).getDate();
                        this.selectedMonth = (new Date()).getMonth() + 1;
                        this.selectedYear = (new Date()).getFullYear();
                        // obtain course structure form DB
                        utils.get_ws('coursestructure', {
                            courseid: parseInt(course.id, 10)
                        }, function (e) {
                            try {
                                _this.resources = JSON.parse(e.data);
                            } catch (e) {
                                console.error(e);
                            }
                        });
                        this.margins = margins;
                        this.width = width;
                        this.milestones.forEach(function (d, i) {
                            d.start = new Date(d.start);//formatDate2(new Date(d.start));
                            d.end = new Date(d.end);//formatDate2(new Date(d.end));
                            d.g = 1;
                        });

                        this.xmin = d3.min(this.milestones, function (d) {
                            return d.start;
                        });
                        this.xmax = d3.max(this.milestones, function (d) {
                            return d.end;
                        });
                        this.ymax = 3;// this.milestones.length;

                        const x = d3.scaleTime()
                            .domain(this.range) // .x(d3.scaleTime().domain(xRange) // [this.xmin, this.xmax]
                            .range([0, this.width - this.padding]); // 
                        const y = d3.scaleLinear()
                            .domain([0, this.ymax])
                            .range([0, this.height]);
                        const z = d3.scaleOrdinal()
                            .range(this.colors);

                        this.xAxis = d3.axisTop().scale(x).ticks(10).tickFormat(multiFormat);
                        this.yAxis = d3.axisLeft().scale(y).ticks(0);

                        // Tooltip
                        /* var tip = d3.tip()
                            .attr('class', 'd3-tip').direction('se').offset([-10, 0])
                            .html(function (d, i) { return arr = [ "n: " + i, "Group: " + d.g ].join('<br>'); });
                        */

                        // Adds the svg canvas
                        this.chart = d3.select('#milestone-chart .chart svg g');
                        
                        // Add the Axis
                        this.x_axis_call = this.chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").call(this.xAxis);
                        this.y_axis_call = this.chart.append("g").attr("class", "y axis").call(this.yAxis);
                        this.x = x;
                        this.y = y;
                        this.updateChart(this.range);

                        dc.registerChart(this.chart, mainGroup);

                    },
                    getMilestones: function () {
                        return this.milestones;
                    },
                    x: function () {
                        return d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding]); // 
                    },
                    xx: function (x) {
                        let x_ = d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding])(x);
                        return x_;
                    },
                    y: function () {
                        return d3.scaleLinear()
                            .domain([0, this.ymax])
                            .range([0, this.height]);
                    },
                    z: function () {
                        return d3.scaleOrdinal()
                            .range(this.colors);
                    },
                    getYLane: function (id) {
                        return id % 3;
                    },
                    updateChart: function (range) {
                        this.range = range;
                        z = d3.scaleOrdinal()
                            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                        this.x_axis_call.transition().duration(500).call(this.xAxis.scale(d3.scaleTime()
                            .domain(this.range)
                            .range([0, this.width - this.padding])).ticks(10).tickFormat(multiFormat));
                        this.y_axis_call.transition().duration(0).call(this.yAxis.scale(this.y));

                        // today
                        const today = new Date();
                        this.chart.selectAll(".today-line").remove();
                        this.chart.append("line")
                            .attr("class", "today-line")
                            .attr("x1", this.xx(today))  //<<== change your code here
                            .attr("y1", 0)
                            .attr("x2", this.xx(today))  //<<== and here
                            .attr("y2", this.height)
                            .attr("stroke-width", 2)
                            .attr("stroke", "red")
                            .attr("opacity", '0.7')
                            .attr("fill", "none");
                        this.chart.selectAll(".today-label").remove();
                        this.chart
                            .append("text")
                            .attr("class", "today-label")
                            .attr("y", 10)
                            .attr("x", this.xx(today) + 4)
                            .attr('text-anchor', 'right')
                            .text("heute")
                            .attr("fill", "red")
                            .attr("opacity", "0.7")
                            .attr("opacity", "0.7")
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            ;
                        this.$forceUpdate();
                    },
                    showModal: function (e) {
                        this.reflectionsFormVisisble = this.getSelectedMilestone().status === 'reflected' ? true : false;
                        this.selectedMilestone = e;//parseInt(e.target.id.replace('milestoneBar_', ''), 10);
                        this.modalVisible = true;
                    },
                    closeModal: function (e) {
                        this.modalVisible = false;
                        this.updateMilestoneStatus();
                        this.updateChart(this.range);
                        // highlight selected activities
                        for (let i = 0; i < this.getSelectedMilestone().resources.length; i++) {
                            console.log(this.getSelectedMilestone().resources[i].instance_url_id)
                            $('#module-' + this.getSelectedMilestone().resources[i].instance_url_id).addClass('resource-highlight');
                        }
                    },
                    getSelectedMilestone: function () {
                        if (this.selectedMilestone === -1) {
                            return this.emptyMilestone;
                        }
                        let _this = this;
                        return this.milestones.filter(function (d) {
                            return d.id === _this.selectedMilestone;
                        })[0];
                    },
                    showEmptyMilestone: function (e) {
                        this.selectedMilestone = -1;
                        this.modalVisible = true;
                    },
                    validateMilestoneForm: function () {
                        let valid = true;
                        if (this.getSelectedMilestone().name.length === 0) {
                            valid = false;
                        }
                        if (this.getSelectedMilestone().objective.length === 0) {
                            valid = false;
                        }
                        if (this.getSelectedMilestone().resources.length === 0) {
                            valid = false;
                        }
                        return valid;
                    },
                    createMilestone: function (e) {
                        this.emptyMilestone.id = Math.random() * 1000;
                        this.emptyMilestone.end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
                        const d = new Date();
                        this.emptyMilestone.start = new Date((d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear());

                        this.milestones.push(this.emptyMilestone);
                        let x = d3.scaleTime().domain(this.range).range([0, width]);
                        let y = d3.scaleLinear().domain([0, this.ymax]).range([0, this.height]);
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
                        };
                    },
                    removeMilestone() {
                        this.closeModal();
                        $('div.modal-backdrop.show').remove();
                        for (let s = 0; s < this.milestones.length; s++) {
                            if (this.milestones[s].id === this.selectedMilestone) {
                                this.milestones.splice(s, 1);
                                this.selectedMilestone = -1;
                            }
                        }
                    },
                    daySelected: function (event) {
                        if ([4, 6, 9, 11].indexOf(this.selectedMonth) !== -1 && event.target.value === 31) {
                            this.dayInvalid = true;
                            return;
                        } else if (this.selectedMonth === 2 && event.target.value > 29) {
                            this.dayInvalid = true;
                            return;
                        } else if (this.selectedMonth === 2 && event.target.value === 29 && !(this.selectedYear % 4 === 0 && this.selectedYear % 100 !== 0 || this.selectedYear % 400 === 0)) {
                            this.dayInvalid = true;
                            return;
                        } else {
                            this.dayInvalid = false;
                        }
                        this.selectedDay = event.target.value;
                        this.getSelectedMilestone().end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
                    },
                    monthSelected: function (event) {
                        this.selectedMonth = event.target.value;
                        this.getSelectedMilestone().end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
                    },
                    yearSelected: function (event) {
                        this.selectedYear = event.target.value;
                        this.getSelectedMilestone().end = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
                    },
                    dayRange: function () {
                        return [...Array(32).keys()].slice(1, 32);
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
                    resourceById: function (id) {
                        return this.resources.filter(function (s) {
                            return parseInt(s.id, 10) === parseInt(id, 10) ? true : false;
                        })[0];
                    },
                    strategySelected: function (event) {
                        let el = this.strategyById(event.target.value);
                        if (this.getSelectedMilestone().strategies.indexOf(el) === -1) {
                            this.getSelectedMilestone().strategies.push(el);
                        }
                    },
                    strategyRemove: function (id) {
                        for (let s = 0; s < this.getSelectedMilestone().strategies.length; s++) {
                            if (this.getSelectedMilestone().strategies[s].id === id) {
                                this.getSelectedMilestone().strategies.splice(s, 1);
                            }
                        }
                    },
                    resourceSelected: function (event) {
                        let el = this.resourceById(event.target.value);
                        if (this.getSelectedMilestone().resources.indexOf(el) === -1) {
                            this.getSelectedMilestone().resources.push(el);
                        }
                    },
                    resourceRemove: function (id) {
                        for (let s = 0; s < this.getSelectedMilestone().resources.length; s++) {
                            if (this.getSelectedMilestone().resources[s].id === id) {
                                this.getSelectedMilestone().resources.splice(s, 1);
                            }
                        }
                    },
                    limitTextLength: function (str, max) {
                        const len = str.length;
                        if (len > max) {
                            return str.substr(0, max - 4) + '..' + str.substr(len - 4, len);
                        } else {
                            return str;
                        }
                    },
                    updateMilestoneStatus() {
                        const t = new Date();
                        for (let i = 0; i < this.milestones.length; i++) {
                            let diff = moment(t).diff(moment(this.milestones[i].end), 'days');

                            this.milestones[i].status = 'progress';

                            if (diff < 3 && this.milestones[i].progress !== 1) {
                                this.milestones[i].status = 'urgent';
                            }

                            if (diff < 0 && this.milestones[i].progress !== 1) {
                                this.milestones[i].status = 'missed';
                            }

                            if (this.milestones[i].progress === 1) {
                                this.milestones[i].status = 'ready';
                            }

                            if (this.milestones[i].progress === 1 && this.milestones[i].reflections.length > 0) {
                                this.milestones[i].status = 'reflected';
                            }
                            console.log(this.milestones[i].status);
                        }
                    },
                    toggleReflectionsForm: function () {
                        this.reflectionsFormVisisble = !this.reflectionsFormVisisble; console.log(this.reflectionsFormVisisble)
                    },
                    validateReflectionForm: function () {
                        let valid = true;
                        let r = this.getSelectedMilestone().reflections;
                        for (let i = 0; i < r.length; i++) {
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
                        let range = [];
                        const now = new Date();
                        switch (preset) {
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
                        timeFilterChart.replaceFilter(dc.filters.RangedFilter(range[0], range[1]));
                        filterTime();
                    }
                }
            });

            
            // FILTER CHART
            const semesterLimit = crossfilter([{ date: new Date(2019, 9, 1), y: 1 }, { date: new Date(2020, 2, 31), y: 1 }]);
            let timeFilterLimitDim = semesterLimit.dimension(function (d) { return d.date; });
            let timeFilterLimitGroup = timeFilterLimitDim.group().reduceCount(function (d) { return [0, d.date, 1]; });

            let timeFilterDim = facts.dimension(function (d) { return d.date; });
            let timeFilterGroup = timeFilterDim.group().reduceCount(function (d) { return d.date; });

            let milestoneData = milestoneApp.getMilestones();
            for (let i = 0; i < milestoneData.length; i++) { milestoneData[i].y = i % 2 + 1; }
            const msData = crossfilter(milestoneData);
            let msFilterDim = msData.dimension(function (d) { return [d.status, d.end, d.y]; });
            let msFilterGroup = msFilterDim.group().reduceCount(function (d) { return d.end; });

            timeFilterChart
                .width(width)
                .height(80)
                .margins({ top: 10, bottom: 10, left: margins.left - 10, right: margins.right })
                .compose([
                    dc.barChart(timeFilterChart)
                        .dimension(timeFilterLimitDim)
                        .group(timeFilterLimitGroup)
                        /*.keyAccessor(function (p) {
                            return p.key[1];
                        })
                        .valueAccessor(function (p) {
                            return p.key[2];
                        })
                        .radiusValueAccessor(function (p) {
                            return 0.4;
                        })*/
                        ,
                        //.barPadding(0)
                        //.gap(0)
                        //.alwaysUseRounding(true),
                    dc.barChart(timeFilterChart)
                        .dimension(timeFilterDim)
                        .group(timeFilterGroup)
                        .barPadding(0)
                        .gap(0)
                        .alwaysUseRounding(true),
                    dc.bubbleChart(timeFilterChart)
                        .dimension(msFilterDim)
                        .group(msFilterGroup)
                        .keyAccessor(function (p) {
                            return p.key[1];
                        })
                        .valueAccessor(function (p) {
                            return p.key[2];
                        })
                        .radiusValueAccessor(function (p) {
                            return 0.4;
                        })
                        .colors(
                            d3.scaleOrdinal()
                                .domain(["urgent", "missed", "progress", "ready", "refelcted"])
                                // ["#ffa500","ff420e","#80bd9e", "#89da59", "#004C97"]
                                .range(color_ms_status_range))
                        .colorAccessor(function (d) { return d.key[0]; })
                        .renderLabel(false)
                        .renderTitle(false)
                ])
                .x(d3.scaleTime().domain(xRange).range([0, width]))
                //.round(d3.timeWeeks.round)
                .elasticX(true)
                .elasticY(true)
                //.xUnits(d3.timeWeek) 
                .xAxisLabel('', 3)
                //.ticks(d3.timeWeeks, 4)
                //.tickFormat(formatWeekNum)
                ;
            
            timeFilterChart.xAxis(d3.axisTop().ticks(10));
            timeFilterChart.xAxis().tickFormat(multiFormat);
            timeFilterChart
                .yAxisLabel('', 10)
                .yAxis()
                .ticks(2)
                ;
            timeFilterChart.x(d3.scaleTime().domain(xRange).range([0, width]));
            
            


            /**
             * filterTime
             * @description Estimated the time range from the timeFilterChart and redefines the x-axis of the main chart arcodingly.
             * @param {*} chart 
             */
            function filterTime(the_chart) {
                let range = timeFilterChart.filters()[0] === undefined ? xRange : timeFilterChart.filters()[0];
                // apply filter to main chart and milestone chart
                chart.x(d3.scaleTime().domain(range));
                milestoneApp.updateChart(range);
            }
            timeFilterChart.on('filtered', filterTime);// other events: preRender, preRedraw


            /**
             * Resize charte if window sizes change
             */
            window.onresize = function (event) {
                width = document.getElementById('dc-chart').offsetWidth;
                milestoneApp.width = width - margins.right;
                //milestoneApp.width(width);
                chart.width(width).transitionDuration(0);
                chart.group(mainGroup);

                timeFilterChart.width(width);//.transitionDuration(0);
                //dc.redrawAll(mainGroup);
                filterTime();
            };

            dc.renderAll();
            var t = d3.select('#filter-chart svg');
            var g = t.insert('g',':first-child')
                .attr('transform', 'translate(' + 0 + ', ' + 10 + ')')
                .append('rect', ':first-child')
                    .attr('class', 'filter-background')
                    .attr('width', '100%') 
                    .attr('height', 58 )
                ;
            /* xxx 
                t.select('.y')
                .attr('transform','translate(100,10)');
            
                t.selectAll('g.y    g.tick text')
                .attr('text-anchor', 'start');
                */
        };// end draw
    };// end Timeline

    return Timeline;
});








