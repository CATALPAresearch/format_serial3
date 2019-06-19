


define(['jquery', 'core/ajax'], function ($, ajax) {

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    let Timeline = function (d3, dc, crossfilter, utils) {

        const color_range = ['yellow', 'blue', 'purple', 'red', 'orange', 'green', 'black'];

        const action_types = ['mod_glossary', 'mod_forum'];
        const label = { 'mod_forum': 'Forum', 'mod_glossary': 'Glossar' };
        const activity_types = { 'viewed': 'betrachtet', 'updates': 'bearbeitet', 'deleleted': 'gelöscht', 'created': 'erstellt' };
        let width = document.getElementById('dc-chart').offsetWidth;
        const margins = { top: 20, right: 20, bottom: 30, left: 60 };
        const course = {
            id: parseInt($('#courseid').html())/*,
            module: parseInt($('#moduleid').html())*/
        };

        utils.get_ws('logstore', {
            'courseid': course.id
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
                formatHour = locale.format("%Hh"),
                formatDay = locale.format("%a %e.%m."),
                formatDate = locale.format("%d.%m.%Y"),
                formatDate2 = locale.format("%d/%m/%Y"),
                formatWeek = locale.format("%b %d"),
                formatWeekNum = locale.format("%U");
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

            //const milestoneChart = dc.rowChart("#milestone-chart");
            const chart = dc.bubbleChart("#timeline-chart");
            const timeFilterChart = dc.barChart("#filter-chart");
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

            let colorBand = d3.scaleOrdinal().domain(action_types).range(color_range);
            
            chart
                .width(width)
                .height(100)
                .margins(margins)
                .clipPadding(65)
                .renderLabel(false)
                .minRadius(1)
                .maxBubbleRelativeSize(0.3)
                .x(d3.scaleTime().domain(xRange))
                //.y(d3.scale.ordinal().range([0,3]))
                .brushOn(true)
                .dimension(mainDimension)
                .group(mainGroup)
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
                        "Datum: " + formatDate(p.value.date), 
                        "Ort: " + label[action_types[p.value.action_type]],
                        "Aktivität: " + activity_types[p.value.action],
                        "Häufigkeit: " + p.value.count
                    ].join("\n");
                })
                .xAxis(d3.axisBottom())
                ;
            //.elasticX(true) // not working together with filters
            //.xAxisPadding(5) // only working with elasticX
            //                .xAxis()
            //.tickFormat(function(d){ return utils.customTimeFormat(d))
            //.tickFormat(d3.timeFormat("%Y-%m-%d"))

            //.tickFormat(function (d) {
            //  return d < 999 ? d3.format(",d")(d) : d3.format(".2s")(d);
            //})
            ;
            chart.xAxis().tickFormat(multiFormat);

            chart.on('pretransition', function () {
                //chart.select('g.x').attr('transform', 'translate(0,0)');
                chart.selectAll('line.grid-line').attr('y2', chart.effectiveHeight());
            });
            chart
                .elasticY(true)
                .yAxisPadding(0) // for values greater 0 the second tick label disappears
                .yAxis()
                .ticks(action_types.length - 1)
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

            // FILTER CHART
            let timeFilterDim = facts.dimension(function (d) { return d.date; });
            let timeFilterGroup = timeFilterDim.group().reduceCount(function (d) { return d.date; });

            timeFilterChart
                .width(width)
                .height(80)
                .margins(margins)
                .dimension(timeFilterDim)
                .group(timeFilterGroup)//, "Wähle einen Zeitraum um zu zoomen")
                //.legend((dc.legend().x(800).y(10).itemHeight(10).gap(5)))
                //.centerBar(true)
                .barPadding(0)
                .gap(0)
                .x(d3.scaleTime().domain(xRange))
                //.round(d3.timeWeeks.round)
                .elasticX(true)
                .elasticY(true)
                .alwaysUseRounding(true)
                //.xUnits(d3.timeWeek) 
                .xAxisLabel('KW', 3)
                .xAxis()
                //.ticks(d3.timeWeeks, 4)
                //.tickFormat(formatWeekNum)
                .tickFormat(multiFormat)
                ;
            timeFilterChart
                .yAxisLabel('Aktivität', 10)
                .yAxis()
                .ticks(2)
                ;



            // milestone chart
            const milestones = [
                {
                    name: 'MS2',
                    objective: 'Alles lernen',
                    start: '05/29/2019',
                    end: '06/02/2019',
                    ressources: [],
                    strategies: []
                },
                {
                    name: 'MS2',
                    objective: 'Alles lernen',
                    start: '05/14/2019',
                    end: '06/01/2019',
                    ressources: [],
                    strategies: []
                }
            ];


            milestones.forEach(function (d, i) {
                d.start = new Date(d.start);//formatDate2(new Date(d.start));
                d.end = new Date(d.end);//formatDate2(new Date(d.end));
                d.g = 1;
            });


            var
                height = 100,
                xmin = d3.min(milestones, function (d) {
                    return d.start;
                }),
                xmax = d3.max(milestones, function (d) {
                    return d.end;
                }),
                ymax = milestones.length,
                barheight = 30,
                x = d3.scaleTime()
                    .domain([xmin, xmax])
                    //.domain(xRange)
                    .range([0, width]),
                y = d3.scaleLinear()
                    .domain([0, ymax])
                    .range([0, height]),
                z = d3.scaleOrdinal()
                    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            // Define the axes
            var xAxis = d3.axisBottom().scale(x)
                .ticks(10);

            var yAxis = d3.axisLeft().scale(y)
                .ticks(0);

            // Tooltip
            /* var tip = d3.tip()
                .attr('class', 'd3-tip')
                .direction('se')
                .offset([-10, 0])
                .html(function (d, i) {
                    return arr = [
                        "n: " + i,
                        "Group: " + d.g
                    ].join('<br>');
                });
            */

            // Adds the svg canvas
            let milestoneChart = d3.select('#milestone-chart')
                .append("svg")
                .attr("width", width)
                .attr("height", height + margins.top + margins.bottom)
                .append("g")
                .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

            var bars = milestoneChart.selectAll(".bar")
                .data(milestones)
                .enter()
                .append("g");

            bars.append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.start);
                })
                .attr("y", function (d, i) {
                    return y(i) - (barheight / 2);
                })
                .attr("height", barheight)
                .attr("width", function (d) {
                    return x(d.end);
                })
                .attr("fill", function (d) {
                    return z(parseInt(d.g, 10));
                })
                .attr("data-legend", function (d) {
                    return parseInt(d.g, 10);
                })
                //.on('mouseover', tip.show)
                //.on('mouseout', tip.hide)
                ;


            // Add the X Axis
            let x_axis_call = milestoneChart.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
            let y_axis_call = milestoneChart.append("g").attr("class", "y axis").call(yAxis);

            // Title
            milestoneChart.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margins.top / 2))
                .attr("text-anchor", "middle")
                .attr("class", "chart-title")
                .text("");

            // Axis label
            milestoneChart.append("text") // y
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (-10) + "," + (height / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
                .text("yy");

            milestoneChart.append("text") // x
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width / 2) + "," + (height + margins.bottom - 3) + ")") // centre below axis
                .text("");

            /*milestoneChart.call(d3.zoom().on("zoom", function () {
                // filter milestone chart
                let new_x_scale = d3.event.transform.rescaleX(x);
                let new_y_scale = d3.event.transform.rescaleY(y);

                x_axis_call.transition().duration(100).call(xAxis.scale(new_x_scale));

                y_axis_call.transition().duration(0).call(yAxis.scale(new_y_scale));

                bars
                    .attr("x", function (d) {
                        return new_x_scale(d.start);
                    })
                    .attr("y", function (d, i) {
                        return new_y_scale(i) - (barheight / 2);
                    })
                    .attr("width", function (d) {
                        return new_y_scale(d.end);
                    });
            }));*/

            dc.registerChart(milestoneChart, mainGroup);


            /**
             * filterTime
             * @description Estimated the time range from the timeFilterChart and redefines the x-axis of the main chart arcodingly.
             * @param {*} chart 
             */
            function filterTime(the_chart) {
                let range = timeFilterChart.filters()[0] === undefined ? xRange : timeFilterChart.filters()[0];
                // filter the main chart
                chart.x(d3.scaleTime().domain(range));

                //
                range = timeFilterChart.filters()[0] === undefined ? [xmin,xmax] : timeFilterChart.filters()[0];
                //console.log(xmin,xmax,range);
                let new_x_scale = d3.scaleTime().domain(range).range([0, width]);
                let new_y_scale = d3.scaleLinear().domain([0, ymax]).range([0, height]);

                x_axis_call.transition().duration(100).call(xAxis.scale(new_x_scale).ticks(10));
                y_axis_call.transition().duration(0).call(yAxis.scale(new_y_scale));
                //x_axis_call = milestoneChart.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(new_x_scale);
                //y_axis_call = milestoneChart.append("g").attr("class", "y axis").call(new_y_scale);

                milestoneChart.selectAll(".bar").remove();
                bars = milestoneChart.selectAll(".bar")
                    .data(milestones)
                    .enter()
                    .append("g");
                    
                bars
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) {
                        //console.log(x(d.start), new_x_scale(d.start));
                        //console.log('range',range)
                        return new_x_scale(d.start);
                    })
                    .attr("y", function (d, i) {
                        return new_y_scale(i) - (barheight / 2);
                    })
                    .attr("fill", function (d) {
                        return z(parseInt(d.g, 10));
                    })
                    .attr("height", barheight)
                    .attr("width", function (d) {
                        return new_y_scale(d.end);
                    })
                    .attr("data-legend", function (d) {
                        return parseInt(d.g, 10);
                    });
            }
            timeFilterChart.on('filtered', filterTime);// other events: preRender, preRedraw


            dc.renderAll();
        };// end draw
    };// end Timeline

    return Timeline;
});








