"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagEdit = void 0;
const opus_format_1 = require("../formats/opus.format");
const worker_service_1 = require("./worker.service");
const worker = worker_service_1.getWorker('tagEdit');
function tagEdit(songList, newTags) {
    // songList.forEach((sourceFile) => worker.postMessage({ message: 'TagEdit', parameter: { sourceFile, newTags } }))
    console.log(1, new Date().toTimeString());
    opus_format_1.writeOpusTags(songList[0], newTags).then(() => {
        console.log(5, new Date().toTimeString());
    });
}
exports.tagEdit = tagEdit;
