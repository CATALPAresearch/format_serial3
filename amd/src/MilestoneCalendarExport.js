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
 * @class      Timeline
 * @copyright  2020 Marc Burchart, Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */
define([
    M.cfg.wwwroot + '/course/format/ladtopics/lib/build/vue.min.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ICalExport.js',
    M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
], function(Vue, ICalExport, ErrorHandler) {

    require.config({
        enforceDefine: false,
        baseUrl: M.cfg.wwwroot + "/course/format/ladtopics/lib/build",
        paths: {
            "ICAL": ["ical.min"]
        },
        shim: {
            'ICAL': {
                exports: 'ICAL'
            }
        }
    });
    return Vue.component('MilestoneCalendarExport', {

        props: ['milestones', 'calendar'],
        template: '<div class = "milestone-calendar-export"><a class="dropdown-item" @click="exportToICal()" href="#"><i class="fa fa-clock"></i>Termine in Kalender (iCal) exportieren</a></div>',
        methods: {
            exportToICal: function () {
                var _this = this;
                try {
                    
                    require(['ICAL'], function (ICalLib) {
                        
                        // Initialize the calendar
                        let config = {
                            prodid: "APLE",
                            domain: "APLE",
                            tzid: "Europe/Berlin",
                            type: "Gregorian",
                            version: "2.0"
                        };
                        let cal = new ICalExport(ICalLib, config);
                        // Register all Milestones
                        
                        if (_this.milestones && _this.milestones.length > 0) {
                            
                            _this.milestones.forEach(
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
                                                    if (strategie.name) {
                                                        description += "\n- " + done + strategie.name;
                                                    }
                                                }
                                            );
                                        }
                                        data.description = description;
                                        let event = cal.addEvent(data);
                                        // Set an alarm three days before end.
                                        let date = new Date(milestone.start.toISOString());
                                        date.setDate(date.getDate() - 3);
                                        console.log(data);
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
                                        console.log(cal.print());
                                    } catch (error) {
                                        new ErrorHandler(error);
                                    }
                                }
                            );
                        }
                        // Register all calendar events                   
                        if (typeof _this.calendar === "object" && Object.keys(_this.calendar).length > 0) {
                            Object.keys(_this.calendar).forEach(
                                (id) => {
                                    try {
                                        let entry = _this.calendar[id];
                                        let type = "[Nutzertermin]";
                                        switch (entry.eventtype) {
                                            case "course": type = "[Kurstermin]";
                                                break;
                                            case "category": type = "[Kursbereich]";
                                                break;
                                            case "site": type = "[Seitentermin]";
                                                break;
                                            case "group": type = "[Gruppentermin]";
                                                break;
                                        }
                                        let data = {
                                            uid: id + entry.timemodified,
                                            title: type + " " + entry.name,
                                            start: new Date(entry.timestart * 1000)
                                        };
                                        if (entry.timeduration) {
                                            data.stop = new Date(entry.timestart * 1000 + entry.timeduration * 1000);
                                        }
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
                            );
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
                    });
                } catch (error) {
                    new ErrorHandler(error);
                }
            },
        }
    });
});
