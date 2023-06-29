"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const _db_js_1 = require("./db/!db.js");
const initDB_fn_js_1 = __importDefault(require("./db/initDB.fn.js"));
const dbVersion_fn_js_1 = require("./db/dbVersion.fn.js");
worker_threads_1.parentPort.on('message', msg => {
    switch (msg.type) {
        case 'initDb':
            initDb(msg);
            break;
        case 'create':
            create(msg);
            break;
        case 'update':
            update(msg);
            break;
        case 'delete':
            delete_(msg);
            break;
    }
    if (msg.text === 'initDb') {
        initDb(msg);
    }
});
dbVersion_fn_js_1.eventEmitter.on('dbVersionChange', newValue => {
    worker_threads_1.parentPort.postMessage({
        type: 'dbVersionChange',
        data: newValue
    });
});
function create(msg) {
    (0, _db_js_1.addTaskToQueue)(msg.data, 'create');
}
function update(msg) {
    (0, _db_js_1.addTaskToQueue)(msg.data, 'update');
}
function delete_(msg) {
    (0, _db_js_1.addTaskToQueue)(msg.data, 'delete');
}
function initDb(msg) {
    import('./db/!db.js').then(() => {
        (0, initDB_fn_js_1.default)(msg.data.appDataPath);
    });
}
