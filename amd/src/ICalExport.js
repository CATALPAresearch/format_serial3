/**
* @author Marc Burchart
* @email marc.burchart@fernuni-hagen.de
* @description Export all important calendar events using the ical format.
* @version 1.0.0
*/
// @ts-ignore
define([
    'jquery',
    'core/ajax'
    // @ts-ignore
], function ($, ajax) {
    var Messages = {
        InvalidConfigData: "ICalExport: Falsche Konfiguration des Kalenders",
        InvalidEventData: "ICalExport: Falsche Konfiguration des Ereignisses",
        InvalidAlarmData: "ICalExport: Falsche Konfiguration des Alarms"
    };
    var EAlarmType;
    (function (EAlarmType) {
        EAlarmType[EAlarmType["DISPLAY"] = 0] = "DISPLAY";
        EAlarmType[EAlarmType["EMAIL"] = 1] = "EMAIL";
    })(EAlarmType || (EAlarmType = {}));
    return /** @class */ (function () {
        /**
         * The Constructor of the class.
         * @param ICalLib The Library for ICal exports.
         * @param config The config object of the Calendar.
         */
        function class_1(ICalLib, config) {
            if (!this.valConfigData(config))
                throw new Error(Messages.InvalidConfigData);
            this._config = config;
            this._ICalLib = ICalLib;
            this._cal = new ICalLib.Component(['vcalendar', [], []]);
            var vtimezone = new ICalLib.Component("vtimezone");
            var timezone = new ICalLib.Timezone.fromData({
                component: vtimezone,
                tzid: config.tzid
            });
            vtimezone.updatePropertyWithValue("tzid", timezone.toString());
            this._cal.addSubcomponent(vtimezone);
            this._cal.updatePropertyWithValue("prodid", config.prodid);
            this._cal.updatePropertyWithValue("version", config.version);
            this._cal.calscale = config.type.toUpperCase();
        }
        /**
         * Print the result.
         */
        class_1.prototype.print = function () {
            return this._cal.toString();
        };
        /**
         * Validate the given config object.
         * @param data The config object.
         */
        class_1.prototype.valConfigData = function (data) {
            if (typeof data !== "object")
                return false;
            if (typeof data.prodid !== "string" || data.prodid.length <= 0)
                return false;
            if (typeof data.version !== "string" || data.version.length <= 0)
                return false;
            if (typeof data.type !== "string" || data.type.length <= 0)
                return false;
            if (typeof data.domain !== "string" || data.domain.length <= 0)
                return false;
            if (typeof data.tzid !== "string" || data.tzid.length <= 0)
                return false;
            return true;
        };
        /**
         * Add an event to the calendar.
         * @param event {
         *                  uid: number|string;
         *                  title: string;
         *                  start: Date;
         *                  end?: Date;
         *                  description: any;
         *                  location?: string;
         *              }
         * @returns The event object.
         */
        class_1.prototype.addEvent = function (data) {
            if (!this.valEventData(data))
                throw new Error(Messages.InvalidEventData);
            var vevent = new this._ICalLib.Component("vevent");
            var event = new this._ICalLib.Event(vevent);
            event.uid = data.uid + "@" + this._config.domain;
            event.startDate = this._ICalLib.Time.fromJSDate(data.start);
            event.dtstamp = this._ICalLib.Time.now();
            if (data.end)
                event.endDate = this._ICalLib.Time.fromJSDate(data.end);
            event.description = this._encode_utf8(data.description);
            event.summary = this._encode_utf8(data.title);
            if (data.location)
                event.location = this._encode_utf8(data.location);
            this._cal.addSubcomponent(vevent);
            return vevent;
        };
        /**
         * A Method to validate the given event data.
         * @param data The event data object.
         */
        class_1.prototype.valEventData = function (data) {
            if (typeof data !== "object")
                return false;
            if (typeof data.uid !== "string" && typeof data.uid !== "number")
                return false;
            if (typeof data.start !== "object" || !(data.start instanceof Date))
                return false;
            if (typeof data.end !== "object" && typeof data.end !== "undefined")
                return false;
            if (typeof data.end === "object") {
                if (!(data.end instanceof Date))
                    return false;
            }
            if (typeof data.description !== "string")
                return false;
            if (typeof data.location !== "string" && typeof data.location !== "undefined")
                return false;
            return true;
        };
        /**
         * Add an alarm to an event.
         * @param event The event object where the alarm should be added.
         * @param data {
         *                  type: EAlarmType;
         *                  attendee?: string|string[];
         *                  title?: string;
         *                  description: string;
         *                  date: Date
         *              }
         * @return The alarm object.
         */
        class_1.prototype.addAlarm = function (event, data) {
            if (!this.valAlarmData(data))
                throw new Error(Messages.InvalidAlarmData);
            var valarm = new this._ICalLib.Component("valarm");
            valarm.addPropertyWithValue("action", EAlarmType[data.type]);
            if (data.type === EAlarmType.EMAIL && typeof data.attendee !== "undefined") {
                if (typeof data.attendee === "string") {
                    valarm.addPropertyWithValue("attendee", "MAILTO:" + data.attendee);
                }
                else {
                    data.attendee.forEach(function (element) {
                        valarm.addPropertyWithValue("attendee", "MAILTO:" + element);
                    });
                }
            }
            valarm.addPropertyWithValue("dtstamp", this._ICalLib.Time.now());
            valarm.addPropertyWithValue("trigger", this._ICalLib.Time.fromJSDate(data.date));
            if (data.title)
                valarm.addPropertyWithValue("summary", this._encode_utf8(data.title));
            valarm.addPropertyWithValue("description", this._encode_utf8(data.description));
            event.addSubcomponent(valarm);
            return valarm;
        };
        /**
         * A Method to validate the given alarm data.
         * @param data The alarm data object.
         * @return true/false
         */
        class_1.prototype.valAlarmData = function (data) {
            if (typeof data !== "object")
                return false;
            if (typeof data.type !== "number")
                return false;
            if (data.type === EAlarmType.EMAIL) {
                if (typeof data.attendee !== "string" && typeof data.attendee !== "object")
                    return false;
            }
            if (!(data.date instanceof Date))
                return false;
            if (typeof data.description !== "string")
                return false;
            if (typeof data.title !== "string" && typeof data.title !== "undefined")
                return false;
            return true;
        };
        /**
         * Encode to utf-8.
         * @param data The string to encode.
         * @return The encoded string.
         */
        class_1.prototype._encode_utf8 = function (data) {
            return unescape(encodeURIComponent(data.replace(/  +/g, '')));
        };
        return class_1;
    }());
});
