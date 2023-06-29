"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVersion = exports.getVersion = exports.eventEmitter = void 0;
const events_1 = require("events");
exports.eventEmitter = new events_1.EventEmitter();
let dbVersion = 0;
function getVersion() {
    return dbVersion;
}
exports.getVersion = getVersion;
function updateVersion() {
    dbVersion += 1;
    exports.eventEmitter.emit('dbVersionChange', dbVersion);
}
exports.updateVersion = updateVersion;
