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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaskToQueue = exports.JahminDb = void 0;
const dexie_1 = __importDefault(require("dexie"));
const _dbObject_1 = require("./!dbObject");
const bulkDeleteSongs_fn_1 = __importDefault(require("./bulkDeleteSongs.fn"));
const bulkInsertSongs_fn_1 = __importDefault(require("./bulkInsertSongs.fn"));
const bulkUpdateSongs_fn_1 = __importDefault(require("./bulkUpdateSongs.fn"));
class JahminDb extends dexie_1.default {
    constructor() {
        super('JahminDb');
        this.version(2).stores({
            songs: 'ID,PlayCount,Album,AlbumArtist,Artist,Composer,Genre,Title,Track,Rating,Comment,DiscNumber,Date_Year,Date_Month,Date_Day,SourceFile,Extension,Size,Duration,SampleRate,LastModified,BitRate,BitDepth'
        });
    }
}
exports.JahminDb = JahminDb;
// export const db =
(0, _dbObject_1.setDB)(new JahminDb());
let taskQueue = [];
let isQueueRunning = false;
function addTaskToQueue(object, taskType) {
    taskQueue.push({
        object,
        taskType
    });
    if (isQueueRunning === false) {
        isQueueRunning = true;
        runQueue();
    }
}
exports.addTaskToQueue = addTaskToQueue;
function runQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        // Groups all the same tasks together.
        let addSongQueue = taskQueue.filter(task => task.taskType === 'insert');
        let deleteSongQueue = taskQueue.filter(task => task.taskType === 'delete');
        let updateSongQueue = taskQueue.filter(task => task.taskType === 'update' || task.taskType === 'external-update');
        // Removes from the task queue all the tasks that have grouped.
        addSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1));
        deleteSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1));
        updateSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1));
        if (addSongQueue.length === 0 && deleteSongQueue.length === 0 && updateSongQueue.length === 0) {
            isQueueRunning = false;
            return;
        }
        if (addSongQueue.length > 0) {
            // Run Bulk Add
            yield (0, bulkInsertSongs_fn_1.default)(addSongQueue.map(task => task.object));
        }
        if (deleteSongQueue.length > 0) {
            // Run Bulk Delete
            yield (0, bulkDeleteSongs_fn_1.default)(deleteSongQueue.map(task => task.object));
        }
        if (updateSongQueue.length > 0) {
            // Run Bulk Update
            yield (0, bulkUpdateSongs_fn_1.default)(updateSongQueue.map(task => task.object));
        }
        setTimeout(() => {
            runQueue();
        }, 250);
    });
}
