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
exports.addTaskToQueue = void 0;
const bulkInsert_fn_1 = __importDefault(require("../db/bulkInsert.fn"));
const sqlite3 = require('sqlite3').verbose();
let taskQueue = [];
let isQueueRunning = false;
function runQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        // Groups all the same tasks together.
        let addSongQueue = taskQueue.filter(task => task.type === 'create');
        let deleteSongQueue = taskQueue.filter(task => task.type === 'delete');
        let updateSongQueue = taskQueue.filter(task => task.type === 'update' || task.type === 'external-update');
        // Removes from the main task queue all the tasks that have been already grouped.
        addSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1));
        deleteSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1));
        updateSongQueue.forEach(task => taskQueue.splice(taskQueue.indexOf(task), 1));
        // If there are no tasks left in the main task queue, the queue is no longer running.
        if (addSongQueue.length === 0 && deleteSongQueue.length === 0 && updateSongQueue.length === 0) {
            isQueueRunning = false;
            return;
        }
        if (addSongQueue.length > 0) {
            // Run Bulk Add
            yield (0, bulkInsert_fn_1.default)(addSongQueue.map(task => task.data));
        }
        if (deleteSongQueue.length > 0) {
            // Run Bulk Delete
            // await bulkDeleteSongsFn(deleteSongQueue.map(task => task.object))
        }
        if (updateSongQueue.length > 0) {
            // Run Bulk Update
            // await bulkUpdateSongsFn(updateSongQueue.map(task => task.object))
        }
        setTimeout(() => {
            runQueue();
        }, 1000);
    });
}
function addTaskToQueue(data, type) {
    taskQueue.push({
        data,
        type
    });
    if (isQueueRunning === false) {
        isQueueRunning = true;
        runQueue();
    }
}
exports.addTaskToQueue = addTaskToQueue;
