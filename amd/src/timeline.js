


define(['jquery', 'core/ajax'], function ($, ajax) {

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    let Timeline = function (d3, dc, utils) {

        const color_range = ['yellow', 'blue', 'purple', 'red', 'orange', 'green', 'black'];

        const action_types = ['mod_glossary', 'mod_forum'];
        const activity_types = {'viewed':'betrachtet', 'updates':'bearbeitet', 'deleleted':'gelöscht','created':'erstellt'};
        let width = document.getElementById('dc-chart').offsetWidth;
        const margins = { top: 20, right: 20, bottom: 30, left: 60 };
        const label = { 'mod_forum': 'Forum', 'mod_glossary': 'Glossar' };

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
            let dateTimeFormat = d3.time.format('%d/%m/%Y');
            the_data.forEach(function (d, i) {
                d.date = dateTimeFormat.parse((new Date(d.utc * 1000)).toLocaleDateString());
                //d.month = d3.time.month(new Date(d.utc * 1000));
                d.action_type = action_types.indexOf(d.action_type);
            });

            const chart = dc.bubbleChart("#drilldown-chart");
            const timeFilterChart = dc.barChart("#date-chart");
            const facts = crossfilter(the_data);


            let volumeByDate = facts.dimension(function (d) {
                return [d.date, d.action_type, d.action];
            });
            let volumeByDateGroup = volumeByDate.group().reduce(
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
                d3.min(volumeByDateGroup.all(), function (d) { return d.key[0]; }),
                d3.max(volumeByDateGroup.all(), function (d) { return d.key[0]; })
            ];

            //xRange = [new Date("2019,3,21"), new Date("2019,5,21")];
            chart
                .width(width)
                .height(100)
                .margins(margins)
                .clipPadding(65)
                .renderLabel(false)
                .minRadius(1)
                .maxBubbleRelativeSize(0.3)
                .x(d3.time.scale().domain(xRange))
                //.y(d3.scale.ordinal().range([0,3]))
                .brushOn(true)
                .dimension(volumeByDate)
                .group(volumeByDateGroup)
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
                .colors(d3.scale.ordinal().domain('action_type').range(color_range))
                .title(function (p) {
                    return [
                        "Datum: " + utils.p.value.date,
                        "Ort: " + action_types[p.value.action_type],
                        "Aktivität: " + activity_types[p.value.action],
                        "Häufigkeit: " + p.value.count
                    ].join("\n");
                })
                //.elasticX(true) // not working together with filters
                //.xAxisPadding(5) // only working with elasticX
                .xAxis().tickFormat(utils.customTimeFormat)
                ;

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


            let timeFilterDim = facts.dimension(function (d) { return d3.time.week(d.date); });
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
                .x(d3.time.scale().domain(xRange))
                .round(d3.time.weeks.round)
                .elasticX(true)
                .elasticY(true)
                .alwaysUseRounding(true)
                //.xUnits(d3.time.week) 
                .xAxisLabel('KW', 3)
                .xAxis()
                .ticks(d3.time.weeks, 4)
                .tickFormat(d3.time.format('%U'))
                ;
            timeFilterChart
                .yAxisLabel('Aktivität', 10)
                .yAxis()
                .ticks(2)
                ;


            /**
             * 
             * @param {*} chart 
             */
            function calc_domain(the_chart) {
                let fromm, to, range;
                if (timeFilterChart.filters()[0] === undefined){
                    range = xRange;
                }else{
                    fromm = timeFilterChart.filters()[0][0],
                    to = timeFilterChart.filters()[0][1];
                    console.log('filters', fromm, to);
                    range = [fromm, to];
                }
                chart
                    .x(d3.time.scale().domain(range))
                    .keyAccessor(function (p) {
                        return p.value.date;
                    })
                    .valueAccessor(function (p) { //console.log('pp',p)
                        return p.value.action_type;
                    })
                    .radiusValueAccessor(function (p) {
                        return p.value.count;
                    })
                    .dimension(volumeByDate)
                    .group(volumeByDateGroup)
                    ;
            }
            //chart.on('preRender', calc_domain);
            //timeFilterChart.on('preRedraw', calc_domain);
            timeFilterChart.on('filtered', calc_domain);

            dc.renderAll();
        };

        return;
    };

    return Timeline;
});








