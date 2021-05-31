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
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', ({ type, data, appDataPath }) => {
    if (storagePath === undefined)
        storagePath = path_1.default.join(appDataPath, 'storage');
    if (type === 'Add')
        add(data);
});
function add(data) {
    var _a;
    let rootFolder = (_a = data.SourceFile) === null || _a === void 0 ? void 0 : _a.split('/').slice(0, -1).join('/');
    let rootFolderId = hashString_fn_1.hash(rootFolder, 'text');
    let songId = String(hashString_fn_1.hash(data.SourceFile, 'number'));
    const store = new electron_store_1.default({
        cwd: storagePath,
        name: rootFolderId
    });
    store.set(songId, data);
    updateStorageVersion();
}
function updateStorageVersion() {
    if (storagePath) {
        fs_1.default.writeFileSync(path_1.default.join(storagePath, 'version'), String(new Date().getTime()));
    }
}
