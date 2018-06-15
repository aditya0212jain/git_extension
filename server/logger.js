"use strict";
// tslint:disable:no-console
Object.defineProperty(exports, "__esModule", { value: true });
class ConsoleLogger {
    constructor(prefix) {
        this.prefix = prefix;
    }
    warn(...args) {
        console.warn(...this.format(args));
    }
    error(...args) {
        console.error(...this.format(args));
    }
    info(...args) {
        console.info(...this.format(args));
    }
    debug(...args) {
        console.debug(...this.format(args));
    }
    log(...args) {
        console.log(...this.format(args));
    }
    format(args_) {
        const args = args_.filter((a) => a != null);
        if (typeof args[0] === 'string') {
            if (args.length === 1) {
                return [`${this.prefix} ${args[0]}`];
            }
            else if (args.length === 2) {
                return [`${this.prefix} ${args[0]}`, args[1]];
            }
            else {
                return [`${this.prefix} ${args[0]}`, args.slice(1)];
            }
        }
        return [`${this.prefix}`, args];
    }
}
exports.ConsoleLogger = ConsoleLogger;
class NullLogger {
    warn(...args) { }
    error(...args) { }
    info(...args) { }
    log(...args) { }
    debug(...args) { }
}
exports.NullLogger = NullLogger;
