"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagEdit = void 0;
const worker_service_1 = require("./worker.service");
const worker = worker_service_1.getTagEditWorker();
function tagEdit(songList, newTags) {
    songList.forEach((sourceFile) => worker.postMessage({ message: 'TagEdit', parameter: { sourceFile, newTags } }));
}
exports.tagEdit = tagEdit;
