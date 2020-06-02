define([
    'jquery',
    'core/ajax'
], function ($, ajax) {
    var EH = (function () {
        function EH(message, options) {
            this._options = options;
            message = EH._validate(message);
            if (message !== null) {
                var hash = EH._hash(message);
                var found = false;
                for (var i in EH._hashes) {
                    if (hash === EH._hashes[i]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    EH._hashes.push(hash);
                    if (EH._console || (typeof this._options === "object" && this._options.console === true))
                        console.log("ErrorHandler: " + message);
                    if (EH._alert || (typeof this._options === "object" && this._options.alert === true))
                        alert("ErrorHandler: " + message);
                    if (EH._send || (typeof this._options === "object" && this._options.send === true))
                        this._send(message);
                }
            }
        }
        EH.logWindowErrors = function () {
            window.addEventListener('error', function (event) {
                try {
                    var obj = {
                        type: "thrown_error",
                        message: event.message ? event.message : undefined,
                        filename: event.filename ? event.filename : undefined,
                        lineno: event.lineno ? event.lineno : undefined,
                        colno: event.colno ? event.colno : undefined
                    };
                    obj = JSON.stringify(obj);
                    new EH(obj);
                }
                catch (error) { }
            });
            return;
        };
        EH.logConsoleErrors = function () {
            console.error = function () {
                try {
                    var obj = {
                        type: "console_error",
                        arguments: arguments
                    };
                    obj = JSON.stringify(obj);
                    new EH(obj);
                }
                catch (error) { }
            };
            console.warn = function () {
                try {
                    var obj = {
                        type: "console_warn",
                        arguments: arguments
                    };
                    obj = JSON.stringify(obj);
                    new EH(obj);
                }
                catch (error) { }
            };
        };
        EH.prototype._send = function (message) {
            try {
                if (typeof EH.logger === "undefined")
                    throw new Error("No Logger registered");
                EH.logger.add('catched_error', message);
                return true;
            }
            catch (error) {
                error = EH._validate(error);
                if (error !== null) {
                    if (EH._console || (typeof this._options === "object" && this._options.console === true))
                        console.log("ErrorHandler: " + message);
                }
                return false;
            }
        };
        EH._validate = function (message) {
            if (message === null)
                return null;
            if (typeof message === "number")
                message = message.toString();
            if (typeof message === "string" && message.length > 0)
                message = JSON.stringify({ message: message });
            if (typeof message === "object") {
                if (message instanceof Error) {
                    var obj = {
                        name: message.name ? message.name : undefined,
                        message: message.message ? message.message : undefined,
                        stack: message.stack ? message.stack : undefined
                    };
                    message = JSON.stringify(obj);
                }
                else {
                    message = message.toString();
                }
            }
            if (message.length < 1)
                return null;
            return message;
        };
        EH._hash = function (message) {
            var hash = 0;
            for (var i = 0; i < message.length; i++) {
                var char = message.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash;
        };
        EH._hashes = [];
        EH._send = true;
        EH._console = false;
        EH._alert = false;
        return EH;
    }());
    return EH;
});
//# sourceMappingURL=ErrorHandler.js.map