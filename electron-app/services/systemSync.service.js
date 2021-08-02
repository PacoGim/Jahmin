"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaskToSync = exports.getTasksToSync = void 0;
const generateId_fn_1 = require("../functions/generateId.fn");
let deferredPromise = undefined;
let tasksToSync = new Proxy([], {
    set(target, property, value, receiver) {
        target[property] = value;
        if (!isNaN(Number(property))) {
            deferredPromise(target);
        }
        return true;
    }
});
/*

  isDone is not working well
  force new image otherwise it gives back the pre compressed image


*/
function getTasksToSync() {
    return new Promise((resolve) => {
        deferredPromise = resolve;
    });
}
exports.getTasksToSync = getTasksToSync;
function addTaskToSync(task = {}) {
    task.id = generateId_fn_1.generateId();
    tasksToSync.push(task);
}
exports.addTaskToSync = addTaskToSync;
