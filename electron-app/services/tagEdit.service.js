"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagEdit = void 0;
const worker_service_1 = require("./worker.service");
const worker = worker_service_1.getWorker('tagEdit');
function tagEdit(songList, newTags) {
    songList.forEach((sourceFile) => worker === null || worker === void 0 ? void 0 : worker.postMessage({ message: 'TagEdit', parameter: { sourceFile, newTags } }));
}
exports.tagEdit = tagEdit;
