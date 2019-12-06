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
    
    const Messages = {
        InvalidConfigData: "Falsche Konfiguration",
        InvalidEventData: "Invalid Event Data",
        InvalidAlarmData: "Invalid Alarm Data"
    }  

    enum EAlarmType{
        DISPLAY,
        EMAIL
    }

    return class {
        
        private _cal;
        private _config;
        private _ICalLib;
        
        /**
         * The Constructor of the class.
         * @param ICalLib The Library for ICal exports.         
         * @param config The config object of the Calendar.
         */

        constructor(ICalLib, config:IConfig){            
            if(!this.valConfigData(config)) throw new Error(Messages.InvalidConfigData);
            this._config = config;
            this._ICalLib = ICalLib;
            this._cal = new ICalLib.Component(['vcalendar', [], []]); 
            let vtimezone = new ICalLib.Component("vtimezone");
            let timezone = new ICalLib.Timezone.fromData({
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

        public print():string{
            return this._cal.toString();
        }
       
        /**
         * Validate the given config object.
         * @param data The config object.
         */

        public valConfigData(data:IConfig):boolean{
            if(typeof data !== "object") return false;
            if(typeof data.prodid !== "string" || data.prodid.length <= 0) return false;
            if(typeof data.version !== "string" || data.version.length <= 0) return false;
            if(typeof data.type !== "string" || data.type.length <= 0) return false;
            if(typeof data.domain !== "string" || data.domain.length <= 0) return false;
            if(typeof data.tzid !== "string" || data.tzid.length <= 0) return false;
            return true;
        }

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

        public addEvent(data:IEvent):any{
            if(!this.valEventData(data)) throw new Error(Messages.InvalidEventData);
            let vevent = new this._ICalLib.Component("vevent");
            let event = new this._ICalLib.Event(vevent);
            event.uid = `${data.uid}@${this._config.domain}`;
            event.startDate = this._ICalLib.Time.fromJSDate(data.start);
            event.dtstamp = this._ICalLib.Time.now();
            if(data.end) event.endDate = this._ICalLib.Time.fromJSDate(data.end);
            event.description = this._encode_utf8(data.description);  
            event.summary = this._encode_utf8(data.title);
            if(data.location) event.location = this._encode_utf8(data.location);
            this._cal.addSubcomponent(vevent);
            return vevent;
        }

        /**
         * A Method to validate the given event data.
         * @param data The event data object.
         */

        public valEventData(data:IEvent):boolean{
            if(typeof data !== "object") return false;
            if(typeof data.uid !== "string" && typeof data.uid !== "number") return false;
            if(typeof data.start !== "object" || !(data.start instanceof Date)) return false;
            if(typeof data.end !== "object" && typeof data.end !== "undefined") return false;
            if(typeof data.end === "object"){
                if(!(data.end instanceof Date)) return false;
            }
            if(typeof data.description !== "string") return false;
            if(typeof data.location !== "string" && typeof data.location !== "undefined") return false;
            return true;
        }

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

        public addAlarm(event:any, data:IAlarm):any{            
            if(!this.valAlarmData(data)) throw new Error(Messages.InvalidAlarmData);
            let valarm = new this._ICalLib.Component("valarm"); 
            valarm.addPropertyWithValue("action", EAlarmType[data.type]);
            if(data.type === EAlarmType.EMAIL && typeof data.attendee !== "undefined"){
                if(typeof data.attendee === "string"){
                    valarm.addPropertyWithValue("attendee", `MAILTO:${data.attendee}`);
                } else {
                    data.attendee.forEach(
                        (element) => {
                            valarm.addPropertyWithValue("attendee", `MAILTO:${element}`);
                        }
                    );
                }
            }
            valarm.addPropertyWithValue("dtstamp", this._ICalLib.Time.now());
            valarm.addPropertyWithValue("trigger", this._ICalLib.Time.fromJSDate(data.date));
            if(data.title) valarm.addPropertyWithValue("summary", this._encode_utf8(data.title));
            valarm.addPropertyWithValue("description", this._encode_utf8(data.description));    
            event.addSubcomponent(valarm);
            return valarm;
        }

        /**
         * A Method to validate the given alarm data.
         * @param data The alarm data object.
         * @return true/false
         */
        
        public valAlarmData(data:IAlarm):boolean{            
            if(typeof data !== "object") return false;                        
            if(typeof data.type !== "number") return false;                    
            if(data.type === EAlarmType.EMAIL){                
                if(typeof data.attendee !== "string" && typeof data.attendee !== "object") return false;
            }         
            if(!(data.date instanceof Date)) return false;             
            if(typeof data.description !== "string") return false;
            if(typeof data.title !== "string" && typeof data.title !== "undefined") return false;
            return true;
        }  

        /**
         * Encode to utf-8.
         * @param data The string to encode.
         * @return The encoded string.
         */
        
        private _encode_utf8(data:string):string{
            return unescape(encodeURIComponent(data.replace(/  +/g,'')));
        }
    } 

    interface IConfig{
        prodid: string;
        domain: string;
        tzid: string;
        type: string;
        version: string;
    }

    interface IEvent{
        uid: number|string;
        title: string;
        start: Date;
        end?: Date;
        description: string;
        location?: string;
    }

    interface IAlarm{
        type: EAlarmType;
        attendee?: string|string[];
        title?: string;
        description: string;
        date: Date
    }      
});