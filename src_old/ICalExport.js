define([
    'jquery',
    'core/ajax'
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
    return (function () {
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
            var daylight = new ICalLib.Component("daylight");
            daylight.addPropertyWithValue("dtstart", new ICalLib.Time({
                year: 1996,
                month: 3,
                day: 31,
                hour: 2
            }));
            daylight.addPropertyWithValue('tzoffsetfrom', '+01:00');
            daylight.addPropertyWithValue('tzoffsetto', '+02:00');
            daylight.addPropertyWithValue('tzname', 'cest');
            daylight.addPropertyWithValue('rrule', new ICalLib.Recur({
                freq: 'YEARLY',
                bymonth: 3,
                byday: '-1SU'
            }));
            vtimezone.addSubcomponent(daylight);
            var standard = new ICalLib.Component('standard');
            standard.addPropertyWithValue('dtstart', new ICalLib.Time({
                year: 1996,
                month: 10,
                day: 27,
                hour: 3
            }));
            standard.addPropertyWithValue('tzname', 'cet');
            standard.addPropertyWithValue('tzoffsetfrom', '+02:00');
            standard.addPropertyWithValue('tzoffsetto', '+01:00');
            standard.addPropertyWithValue('rrule', new ICalLib.Recur({
                freq: 'YEARLY',
                bymonth: 10,
                byday: '-1SU'
            }));
            vtimezone.addSubcomponent(standard);
            this._cal.addSubcomponent(vtimezone);
            this._cal.updatePropertyWithValue("prodid", config.prodid);
            this._cal.updatePropertyWithValue("version", config.version);
            this._cal.calscale = config.type.toUpperCase();
        }
        class_1.prototype.print = function () {
            return this._cal.toString();
        };
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
        class_1.prototype.addEvent = function (data) {
            if (!this.valEventData(data))
                throw new Error(Messages.InvalidEventData);
            var vevent = new this._ICalLib.Component("vevent");
            var event = new this._ICalLib.Event(vevent);
            vevent.addPropertyWithValue("dtstamp", this._ICalLib.Time.now());
            event.uid = data.uid + "@" + this._config.domain;
            event.startDate = this._ICalLib.Time.fromJSDate(data.start);
            if (data.end)
                event.endDate = this._ICalLib.Time.fromJSDate(data.end);
            event.description = this._encode_utf8(data.description);
            event.summary = this._encode_utf8(data.title);
            if (data.location)
                event.location = this._encode_utf8(data.location);
            this._cal.addSubcomponent(vevent);
            return vevent;
        };
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
        class_1.prototype._encode_utf8 = function (data) {
            return unescape(encodeURIComponent(data.replace(/  +/g, '')));
        };
        return class_1;
    }());
});
//# sourceMappingURL=ICalExport.js.map