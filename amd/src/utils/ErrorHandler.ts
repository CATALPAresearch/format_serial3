/**
* @author Marc Burchart
* @email marc.burchart@fernuni-hagen.de
* @description  
* @version 1.0.0
*/

// @ts-ignore
define([
    'jquery',
    'core/ajax' 
// @ts-ignore
], function ($, ajax) {

    class EH {

        private _options?:EHOptions;
        private static _hashes:number[] = [];
        private static readonly _send:boolean = true;
        private static readonly _console:boolean = false;
        private static readonly _alert:boolean = false;
        public static logger:any;

        constructor(message:any, options?:EHOptions){
            this._options = options;
            message = EH._validate(message);
           
            if(message !== null){                
                let hash = EH._hash(message);
                let found = false;
                for(let i in EH._hashes){
                    if(hash === EH._hashes[i]){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    EH._hashes.push(hash);                   
                    if(EH._console || (typeof this._options === "object" && this._options.console === true)) console.log(`ErrorHandler: ${message}`);
                    if(EH._alert || (typeof this._options === "object" && this._options.alert === true)) alert(`ErrorHandler: ${message}`);
                    if(EH._send || (typeof this._options === "object" && this._options.send === true)) this._send(message);                   
                }                
            }  
        }

        public static logWindowErrors(){
            window.addEventListener('error', 
                function(event) { 
                    try{                        
                        let obj:any = {
                            type: "thrown_error",
                            message: event.message?event.message:undefined,
                            filename: event.filename?event.filename:undefined,
                            lineno: event.lineno?event.lineno:undefined,
                            colno: event.colno?event.colno:undefined
                        }
                        obj = JSON.stringify(obj);                 
                        new EH(obj);
                    } catch(error){}           
                }
            );         
            return;
        }

        public static logConsoleErrors(){
            console.error = function(){
                try{
                    let obj:any = {
                        type: "console_error",
                        arguments: arguments
                    }
                    obj = JSON.stringify(obj);
                    new EH(obj);
                } catch(error){}               
            }
            console.warn = function(){
                try{
                    let obj:any = {
                        type: "console_warn",
                        arguments: arguments
                    }
                    obj = JSON.stringify(obj);
                    new EH(obj);
                } catch(error){}               
            }
        }

        private _send(message):boolean{
            try{
                if(typeof EH.logger === "undefined") throw new Error("No Logger registered");
                EH.logger.add('catched_error', message);               
                return true;
            } catch(error){
                error = EH._validate(error);
                if(error !== null){
                    if(EH._console || (typeof this._options === "object" && this._options.console === true)) console.log(`ErrorHandler: ${message}`);
                }                
                return false;
            }
        }

        private static _validate(message:any):string|null{            
            if(message === null) return null;
            if(typeof message === "number") message = message.toString();
            if(typeof message === "string" && message.length > 0) message = JSON.stringify({message: message});
            if(typeof message === "object"){
                if(message instanceof Error){
                    let obj = {
                        name: message.name?message.name:undefined,
                        message: message.message?message.message:undefined,
                        stack: message.stack?message.stack:undefined
                    }
                    message = JSON.stringify(obj);
                } else {
                    message = message.toString();
                }                
            }
            if(message.length < 1) return null;
            return message;
        }

        private static _hash(message:string):number{
            let hash = 0;
            for(let i = 0; i < message.length; i++){
                let char = message.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash;
        }

    }  

    interface EHOptions{
        send?: boolean;
        console?: boolean;
        alert?: boolean;
    }

    return EH;

});