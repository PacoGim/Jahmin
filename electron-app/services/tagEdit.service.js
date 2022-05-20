"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTagEditProgress = exports.tagEdit = void 0;
const aac_format_1 = require("../formats/aac.format");
const flac_format_1 = require("../formats/flac.format");
const mp3_format_1 = require("../formats/mp3.format");
const opus_format_1 = require("../formats/opus.format");
// const worker = getWorker('tagEdit')
let songToEditQueue = [];
let maxQueueLength = 0;
let isQueueRunning = false;
function tagEdit(songList, newTags) {
    songList.forEach(sourceFile => songToEditQueue.push({ sourceFile, newTags }));
    if (maxQueueLength < songToEditQueue.length) {
        maxQueueLength = songToEditQueue.length;
    }
    if (isQueueRunning === false) {
        isQueueRunning = true;
        processQueue();
    }
}
exports.tagEdit = tagEdit;
function processQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        let task = songToEditQueue.shift();
        // If no more tasks then stop processing queue.
        if (task === undefined)
            return (isQueueRunning = false);
        let extension = task.sourceFile.split('.').pop();
        let result;
        switch (extension) {
            case 'm4a':
                result = yield (0, aac_format_1.writeAacTags)(task.sourceFile, task.newTags);
                break;
            case 'flac':
                result = yield (0, flac_format_1.writeFlacTags)(task.sourceFile, task.newTags);
                break;
            case 'opus':
                result = yield (0, opus_format_1.writeOpusTags)(task.sourceFile, task.newTags);
                break;
            case 'mp3':
                result = yield (0, mp3_format_1.writeMp3Tags)(task.sourceFile, task.newTags);
                break;
            default:
                break;
        }
        processQueue();
    });
}
function getTagEditProgress() {
    return {
        maxLength: maxQueueLength,
        currentLength: songToEditQueue.length
    };
}
exports.getTagEditProgress = getTagEditProgress;
