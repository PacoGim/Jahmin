"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const worker_threads_1 = require("worker_threads");
const hashString_fn_1 = require("../functions/hashString.fn");
let storagePath = undefined;
let workQueue = [];
let isWorkQueueuIterating = false;
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', ({ type, data, appDataPath }) => {
    if (appDataPath && storagePath === undefined)
        storagePath = path_1.default.join(appDataPath, 'storage');
    if (type === 'Add' || type === 'Delete' || type === 'Update') {
        workQueue.push({
            type,
            data
        });
        if (!isWorkQueueuIterating) {
            isWorkQueueuIterating = true;
            iterateWorkQueue();
        }
    }
});
function iterateWorkQueue() {
    let work = workQueue.shift();
    if (work) {
        if (work.type === 'Add') {
            add(work.data).then(() => {
                // Tell to storage service to add to array
                worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
                    type: work === null || work === void 0 ? void 0 : work.type,
                    data: work === null || work === void 0 ? void 0 : work.data
                });
                iterateWorkQueue();
            });
            // process.nextTick(() => iterateWorkQueue())
        }
    }
    else {
        isWorkQueueuIterating = false;
    }
}
let storesMap = new Map();
function add(data) {
    return new Promise((resolve, reject) => {
        var _a;
        let rootFolder = (_a = data.SourceFile) === null || _a === void 0 ? void 0 : _a.split('/').slice(0, -1).join('/');
        let rootFolderId = hashString_fn_1.hash(rootFolder, 'text');
        let songId = String(hashString_fn_1.hash(data.SourceFile, 'number'));
        let store = storesMap.get(rootFolderId);
        if (!store) {
            store = new electron_store_1.default({
                cwd: storagePath,
                name: rootFolderId
            });
            storesMap.set(rootFolderId, store);
        }
        store.set(songId, data);
        updateStorageVersion();
        resolve('');
    });
}
function updateStorageVersion() {
    if (storagePath) {
        fs_1.default.writeFileSync(path_1.default.join(storagePath, 'version'), String(new Date().getTime()));
    }
}
