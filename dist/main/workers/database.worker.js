"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const index_db_js_1 = require("./db/index.db.js");
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
function create(msg) {
    (0, index_db_js_1.addToQueue)({ data: msg.data, type: 'create' }, { at: 'end' });
}
function update(msg) {
    (0, index_db_js_1.addToQueue)({ data: msg.data, type: 'update' }, { at: 'start' });
}
function delete_(msg) {
    (0, index_db_js_1.addToQueue)({ data: msg.data, type: 'delete' }, { at: 'start' });
}
function initDb(msg) {
    import('./db/index.db.js').then(newDb => {
        newDb.init(msg.data.appDataPath);
    });
}
