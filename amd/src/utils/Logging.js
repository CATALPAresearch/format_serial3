/* eslint-disable valid-jsdoc */
/**
 * name: Logging
 * author: 2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * license: MIT License
 * description: Logs user behavior data inclunding informations about the client system, browser, and time.
 * todo:
 */


define([
    'jquery', 
    'core/ajax', 
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/utils/Utils.js"
], function ($, ajax, utils) {
    
    utils = new utils();
    
    var Log = function(courseid, options) {
        this.utils = utils;
        this.courseid = courseid;
        this.name = 'log_ladtopics';
        this.options = this.utils.mergeObjects({
            outputType: 0, // -1: no logging, 0: console.log(), 1: server log, 
            prefix: '',
            loggerServiceUrl: null,
            loggerServiceParams: { "data": {} },
            context: 'default-context'
        }, options);

        this.ip = '';

        /**
         * Adds a message to the log by constructing a log entry
         */
        this.add = function (action, msg) {

            var logEntry = {
                utc: (new Date()).getTime(),
                location: {
                    //protocol: window.location.protocol,
                    //port: window.location.port,
                    host: window.location.host,
                    pathname: window.location.href,
                    hash: window.location.hash,
                    tabId: window.name.split('=')[0] === "APLE-MOODLE" ? window.name.split('=')[1] : "unknown"
                },
                context: this.options.context,
                action: action,
                value: msg
            };
            if (action === 'open_planing_tool') {
                logEntry.userAgent = {
                    cpu: navigator.oscpu,
                    platform: navigator.platform,
                    engine: navigator.product,
                    browser: navigator.appCodeName,
                    browserVersion: navigator.appVersion,
                    userAgent: navigator.userAgent.replace(/,/gm, ';'),
                    screenHeight: screen.height, // document.body.clientHeight
                    screenWidth: screen.width // document.body.clientWidth
                    // retina
                };
            }
            this.output(logEntry);
        };

        /**
         * Validates the msg against illegal characters etc.
         */
        this.validate = function (msg) {
            return msg;
        };

        /**
         * Returs structured time information
         */
        this.getLogTime = function () {
            var date = new Date();
            var s = date.getSeconds();
            var mi = date.getMinutes();
            var h = date.getHours();
            var d = date.getDate();
            var m = date.getMonth() + 1;
            var y = date.getFullYear();

            return {
                utc: date.getTime(),
                date: y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d),
                time: (h <= 9 ? '0' + h : h) + ':' + (mi <= 9 ?
                    '0' + mi : mi) + ':' + (s <= 9 ?
                        '0' + s : s) + ':' + date.getMilliseconds()
            };
        };

        /**
         * Interface for handling the output of the generated log entry
         */
        this.output = function (logEntry) {
            switch (this.options.outputType) {
                case 0:
                    // eslint-disable-next-line no-console
                    console.log(logEntry);
                    break;
                case 1:
                    this.sendLog(logEntry);
                    //console.log('LOG: ',logEntry.action, logEntry);
                    break;
                default:
                // Do nothing
            }
        };

        /**
         * Makes an AJAX call to send the log data set to the server
         */
        this.sendLog = function(entry) {
            ajax.call([{
                methodname: 'format_ladtopics_logger',
                args: {
                    data: {
                        courseid: this.courseid,
                        utc: Math.ceil(entry.utc / 1000),
                        action: entry.action,
                        entry: JSON.stringify(entry)
                    }
                },
                done: function (e) {
                    //console.log(e)
                },
                fail: function (e) {
                    // throw(e);
                    console.error(e);
                }
            }]);
        };

    };

    return Log;

});