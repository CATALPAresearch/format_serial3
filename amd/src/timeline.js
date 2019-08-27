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
    let Timeline = function (Vue, d3, dc, crossfilter, moment, bselect, utils) {

        //const vuemilestone = new Milestones(d3);

        const color_range = ['yellow', 'blue', 'purple', 'red', 'orange', 'green', 'black'];
        const color_ms_status_range = ["#ffa500", "#ff0000", "#008000", "#008000", "#0000ff"];
        const label = {
            'mod_forum': 'Forum',
            'mod_glossary': 'Glossar',
            'mod_wiki': 'Wiki',
            'mod_assignment': 'EA',
            'mod_studentquiz': 'SQ',
            'mod_quiz': 'Quiz'
        };
        let action_types = Object.keys(label); //['mod_glossary', 'mod_forum', 'mod_wiki'];
        const activity_types = { 'viewed': 'betrachtet', 'updates': 'bearbeitet', 'deleleted': 'gelöscht', 'created': 'erstellt' };
        let width = document.getElementById('dc-chart').offsetWidth;
        const margins = { top: 15, right: 20, bottom: 20, left: 60 };
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
                .margins({ top: 10, bottom: 10, left: margins.left, right: margins.right })
                .clipPadding(65)
                .renderLabel(false)
                .minRadius(1)
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
                    return p.value.count;
                })
                .colorAccessor(function (kv) { return kv.value.action_type; })
                .colors(colorBand)
                .title(function (p) {
                    return [
                        "Am " + formatDate(p.value.date),
                        " haben Sie " + utils.numberToWord(p.value.count, 'mal'),
                        " das " + label[action_types[p.value.action_type]],
                        " " + activity_types[p.value.action]
                    ].join("");
                })
                .xAxis(d3.axisBottom().ticks(0))
                ;

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

            let milestoneApp = new Vue({
                el: '#milestone-chart',
                components: {
                    //   'modal': modal
                },
                data: function () {
                    return {
                        chart: '',
                        xAxis: '',
                        yAxis: '',
                        x_axis_call: '',
                        y_axis_call: '',
                        colors: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
                        bars: '',
                        barwidth: 80,
                        barheight: 21,
                        width: 730,
                        height: 70,
                        margins: {},
                        padding: 100,
                        xmin: 0,
                        xmax: 0,
                        ymin: 0,
                        ymax: 0,
                        milestones: [
                            {
                                id: 0,
                                name: 'Meilenstein 1',
                                objective: 'Alles lernen',
                                start: '05/31/2019',
                                end: '06/01/2019',
                                status: 'urgent',
                                progress: 0.10,
                                resources: [],
                                strategies: []
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
                                strategies: []
                            }
                        ],
                        emptyMilestone: {
                            id: 10,
                            name: '',
                            objective: '',
                            start: '01/10/2019',
                            end: '02/10/2019',
                            status: 'progress', // progress, ready, urgent, missed, reflected
                            progress: 0.0,
                            resources: [],
                            strategies: []
                        },
                        selectedDay: 1,
                        selectedMonth: 1,
                        selectedYear: 2019,
                        dayInvalid: false,
                        selectedMilestone: 0,
                        modalVisible: false,
                        strategies: [
                            { id: 'mindmap', name: 'Mindmap', url: "http://www.heise.de/", category: 'relations' },
                            { id: 'flashcards', name: 'Lernkarten', url: "http://www.heise.de/", category: 'terms' },
                            { id: 'exerp', name: 'Exzerpieren', url: "http://www.heise.de/", category: 'relations' },
                            { id: 'repeat', name: 'Wiederholung', url: "http://www.heise.de/", category: 'terms' },
                            { id: 'group', name: 'Gruppenarbeit', url: "http://www.heise.de/", category: 'misc' }
                        ],
                        resources: []
                    };
                },
                mounted: function () {
                    let _this = this;
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
                    this.ymax = this.milestones.length;

                    const x = d3.scaleTime()
                        .domain(xRange) // .x(d3.scaleTime().domain(xRange) // [this.xmin, this.xmax]
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
                    this.zoomUpdate(x, y, z);

                    dc.registerChart(this.chart, mainGroup);

                },
                methods: {
                    getMilestones: function(){
                        return this.milestones;
                    },
                    x: function () {
                        return d3.scaleTime()
                            .domain(xRange) // .x(d3.scaleTime().domain(xRange) // [this.xmin, this.xmax]
                            .range([0, this.width - this.padding]); // 
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
                    getYLane: function(id){
                        return id % 3;
                    },
                    zoomUpdate: function (new_x_scale, new_y_scale, z) {
                        let _this = this;
                        this.x = new_x_scale;
                        this.y = new_y_scale;
                        z = d3.scaleOrdinal()
                            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                        this.x_axis_call.transition().duration(500).call(this.xAxis.scale(new_x_scale).ticks(10).tickFormat(multiFormat));
                        this.y_axis_call.transition().duration(0).call(this.yAxis.scale(new_y_scale));

                        /*
                        this.bars = this.chart.selectAll(".milesstone-bar")
                            .data(this.milestones).enter().append("g");
                        
                        this.chart.selectAll(".milestone-label")
                            //.attr('transform', function (d) { console.log(new_x_scale(d.end)); return 'translate(' + new_x_scale(d.end) +',0)'; });
                            .attr("x", function (d) { return new_x_scale(d.end); });

                        
                        // learning progress  
                        this.chart.selectAll(".milestone-learning-progress").remove();
                        this.bars.append("rect")
                            .attr("class", "milestone-learning-progress")
                            .attr("x", function (d) {
                                return new_x_scale(d.end);
                            })
                            .attr("y", function (d, i) {
                                return new_y_scale(i) - (_this.barheight / 2);
                            })
                            .attr("height", this.barheight)
                            .attr("width", function (d) {
                                return _this.barwidth * d.progress;
                            })
                            .on("click", function (d) { _this.showModal(d.id); })
                            .attr('data-toggle', "modal")
                            .attr('data-target', "#theMilestoneModal")
                            ;

                        // MS box representing MS state
                        this.chart.selectAll(".milestone-bar").remove();
                        this.bars
                            .append("rect")
                            .attr("class", function (d) {
                                return "milestone-bar " + " milestone-" + d.status;
                            })
                            .attr("id", function (d) {
                                return 'milestoneBar_' + d.id;
                            })
                            .attr("x", function (d) {
                                return new_x_scale(d.end);
                            })
                            .attr("y", function (d, i) {
                                return new_y_scale(i) - (_this.barheight / 2);
                            })
                            .attr("height", this.barheight)
                            .attr("width", this.barwidth)//return new_y_scale(d.end);
                            .attr("data-legend", function (d) {
                                return parseInt(d.g, 10);
                            })
                            .on("click", function (d) { _this.showModal(d.id); })
                            .attr('data-toggle', "modal")
                            .attr('data-target', "#theMilestoneModal")
                            ;
                        // MS label
                        this.chart.selectAll(".milestone-label").remove();
                        this.bars
                            .append("text")
                            .attr("class", "milestone-label")
                            .attr("x", function (d) { return new_x_scale(d.end) + _this.barwidth / 2; })
                            .attr("y", function (d, i) { return new_y_scale(i) + 4; })
                            .text(function (d) { return d.name; })
                            .on("click", function (d) { _this.showModal(d.id); })
                            .attr('data-toggle', "modal")
                            .attr('data-target', "#theMilestoneModal")
                            ;
*/
                        // today
                        const today = new Date();
                        this.chart.selectAll(".today-line").remove();
                        this.chart.append("line")
                            .attr("class", "today-line")
                            .attr("x1", new_x_scale(today))  //<<== change your code here
                            .attr("y1", 0)
                            .attr("x2", new_x_scale(today))  //<<== and here
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
                            .attr("x", new_x_scale(today) + 4)
                            .attr('text-anchor', 'right')
                            .text("heute")
                            .attr("fill", "red")
                            .attr("opacity", "0.7")
                            .attr("opacity", "0.7")
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            ;
                    },
                    showModal: function (e) {
                        this.selectedMilestone = e;//parseInt(e.target.id.replace('milestoneBar_', ''), 10);
                        this.modalVisible = true;
                    },
                    closeModal: function (e) {
                        this.modalVisible = false;
                    },
                    getSelectedMilestone: function () {
                        if (this.selectedMilestone === -1) {
                            // xxx: set end-Date
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
                    saveMilestone: function (e) {
                        this.emptyMilestone.id = Math.random() * 1000;
                        this.emptyMilestone.end = new Date(this.selectedMonth + '/' + this.selectedDay + '/' + this.selectedYear);
                        const d = new Date();
                        this.emptyMilestone.start = new Date((d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear());

                        this.milestones.push(this.emptyMilestone);
                        let x = d3.scaleTime().domain(xRange).range([0, width]);
                        let y = d3.scaleLinear().domain([0, this.ymax]).range([0, this.height]);
                        this.zoomUpdate(x, y);
                        console.log(this.milestones)
                        // reset the empty milestone
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
                    },
                    monthSelected: function (event) { this.selectedMonth = event.target.value; },
                    yearSelected: function (event) { this.selectedYear = event.target.value; },
                    dayRange: function () {
                        return [...Array(32).keys()].slice(1, 32);
                    },
                    monthRange: function () {
                        return [...Array(13).keys()].slice(1, 13);
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
                        this.getSelectedMilestone().strategies.push(this.strategyById(event.target.value));
                    },
                    strategyRemove: function (id) {
                        for (let s = 0; s < this.getSelectedMilestone().strategies.length; s++) {
                            if (this.getSelectedMilestone().strategies[s].id === id) {
                                this.getSelectedMilestone().strategies.splice(s, 1);
                            }
                        }
                    },
                    resourceSelected: function (event) {
                        this.getSelectedMilestone().resources.push(this.resourceById(event.target.value));
                    },
                    resourceRemove: function (id) {
                        for (let s = 0; s < this.getSelectedMilestone().resources.length; s++) {
                            if (this.getSelectedMilestone().resources[s].id === id) {
                                this.getSelectedMilestone().resources.splice(s, 1);
                            }
                        }
                    },
                    setFilterPreset: function (preset) {
                        let range = [];
                        const now = new Date();
                        switch (preset) {
                            case "last-week":
                                range = [new Date(now.getTime() - 1000 * 3600 * 24 * 7), now];
                                break;
                            case "last-month":
                                range = [new Date(now.getTime() - 1000 * 3600 * 24 * 30), now];
                                break;
                            case "semester": // semester
                                range = [new Date(2019, 9, 1, 0, 0, 0, 0), new Date(2020, 2, 31, 23, 59, 59, 0)];
                        }
                        timeFilterChart.replaceFilter(dc.filters.RangedFilter(range[0], range[1])); //new Date(2019, 5, 9), new Date(2019, 5, 10)
                        filterTime();
                    }
                }
            });


            // FILTER CHART
            let timeFilterDim = facts.dimension(function (d) { return d.date; });
            let timeFilterGroup = timeFilterDim.group().reduceCount(function (d) { return d.date; });

            let milestoneData = milestoneApp.getMilestones();
            for(let i=0; i < milestoneData.length; i++){ milestoneData[i].y = i % 2 +1; }
            const msData = crossfilter(milestoneData);
            let msFilterDim = msData.dimension(function (d) { return [d.status, d.end, d.y]; });
            let msFilterGroup = msFilterDim.group().reduceCount(function (d) { return d.end; });
           
            timeFilterChart
                .width(width)
                .height(80)
                .margins({ top: 10, bottom: 10, left: margins.left - 10, right: margins.right })
                .compose([
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
                //xRange = [new Date(2019, 6, 9), new Date(2019, 6, 10)];
                let range = timeFilterChart.filters()[0] === undefined ? xRange : timeFilterChart.filters()[0];
                // filter the main chart
                chart.x(d3.scaleTime().domain(range));

                //
                range = timeFilterChart.filters()[0] === undefined ? xRange : timeFilterChart.filters()[0]; // [milestoneApp.xmin, milestoneApp.xmax]
                //console.log(xmin,xmax,range); 
                //console.log(timeFilterChart.filters()[0])
                let new_x_scale = d3.scaleTime().domain(range).range([0, width]);
                let new_y_scale = d3.scaleLinear().domain([0, milestoneApp.ymax]).range([0, milestoneApp.height]);

                milestoneApp.zoomUpdate(new_x_scale, new_y_scale);
            }
            timeFilterChart.on('filtered', filterTime);// other events: preRender, preRedraw



            /**
             * Resize charte if window sizes change
             */
            window.onresize = function (event) {
                width = document.getElementById('dc-chart').offsetWidth;
                milestoneApp.width = width - margins.right;
                chart.width(width).transitionDuration(0);
                chart.group(mainGroup);

                timeFilterChart.width(width);//.transitionDuration(0);
                //dc.redrawAll(mainGroup);
                
                
                filterTime();

            };

            dc.renderAll();
        };// end draw
    };// end Timeline

    return Timeline;
});








