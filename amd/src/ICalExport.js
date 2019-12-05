/**
* @author Marc Burchart
* @email marc.burchart@fernuni-hagen.de
* @description A collection of classes to handle the ICAL calendar export.
* @version 1.0.0
*/
// @ts-ignore
define([
    'jquery',
    'core/ajax'
    // @ts-ignore
], function ($, ajax) {
    var Messages = {
        InvalidConfigData: "Falsche Konfiguration",
        InvalidEventData: "Invalid Event Data",
        InvalidAlarmData: "Invalid Alarm Data"
    };
    return /** @class */ (function () {
        /**
         * The Constructor of the class.
         * @param ICalLib The Library for ICal exports.
         * @param view The Vue instance.
         * @param config The config object of the Calendar.
         */
        function class_1(ICalLib, view, config) {
            this._view = view;
            if (!this._valConfigData(config))
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
         * Generate the Caledar to export.
         */
        class_1.prototype.generate = function () {
            var milestones = this._view['milestones'];
            if (typeof milestones === "object") {
                for (var i in milestones) {
                    var milestone = milestones[i];
                    console.log(milestone);
                    console.log(typeof milestone);
                    console.log(milestone.name);
                }
            }
            return this._cal.toString();
        };
        /**
         * Validate the given config object.
         * @param data The config object.
         */
        class_1.prototype._valConfigData = function (data) {
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
         *                  description?: any;
         *                  location?: string;
         *              }
         * @returns The event object.
         */
        class_1.prototype.addEvent = function (data) {
            if (!this._valEventData(data))
                throw new Error("Invalid event data.");
            var vevent = new this._ICalLib.Component("vevent");
            var event = new this._ICalLib.Event(vevent);
            event.uid = data.uid + "@" + this._config.domain;
            event.startDate = this._ICalLib.Time.fromJSDate(data.start);
            if (data.end)
                event.endDate = this._ICalLib.Time.fromJSDate(data.end);
            if (data.description) {
                if (typeof data.description === "object")
                    data.description = data.description.toString();
                event.description = data.description;
            }
            event.summary = data.title;
            if (data.location)
                event.location = data.location;
            this._cal.addSubcomponent(vevent);
            return vevent;
        };
        /**
         * A Method to validate the given event data.
         * @param data The event data object.
         */
        class_1.prototype._valEventData = function (data) {
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
            if (typeof data.location !== "string" && typeof data.location !== "undefined")
                return false;
            return true;
        };
        /**
         * Add an alarm to an event.
         * @param event The event object where the alarm should be added.
         * @param data {
         *                  uid: number|string;
         *                  title: string;
         *                  type: EAlarmType;
         *                  title?: string;
         *                  description?: string;
         *                  attendee?: string;
         *                  duration: [{
         *                      weeks?: number;
         *                      days?: number;
         *                      hours?: number;
         *                      minutes?: number;
         *                      seconds?: number;
         *                      isNegative: boolean;
         *                  }]
         *              }
         * @return The alarm object.
         */
        class_1.prototype.addAlarm = function (event, data) {
            if (!this._valAlarmData(data))
                throw new Error("Invalid alarm data.");
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
            valarm.addPropertyWithValue("trigger", this._ICalLib.Time.fromJSDate(data.date));
            if (data.title)
                valarm.addPropertyWithValue("summary", data.title);
            if (data.description)
                valarm.addPropertyWithValue("description", data.description);
            event.addSubcomponent(valarm);
            return valarm;
        };
        /**
         * A Method to validate the given alarm data.
         * @param data The alarm data object.
         */
        class_1.prototype._valAlarmData = function (data) {
            if (typeof data !== "object")
                return false;
            if (typeof data.type !== "number" || !(data.type in EAlarmType))
                return false;
            if (data.type === EAlarmType.EMAIL) {
                if (typeof data.attendee !== "string" && typeof data.attendee !== "object")
                    return false;
            }
            if (!(data.date instanceof Date))
                return false;
            if (typeof data.description !== "string" && typeof data.description !== "undefined")
                return false;
            if (typeof data.title !== "string" && typeof data.title !== "undefined")
                return false;
            return true;
        };
        return class_1;
    }());
    var EAlarmType;
    (function (EAlarmType) {
        EAlarmType[EAlarmType["DISPLAY"] = 0] = "DISPLAY";
        EAlarmType[EAlarmType["EMAIL"] = 1] = "EMAIL";
    })(EAlarmType || (EAlarmType = {}));
});
