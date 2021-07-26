"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaskToSync = exports.getTasksToSync = void 0;
const generateId_fn_1 = require("../functions/generateId.fn");
let deferredPromise = undefined;
let tasksToSync = new Proxy([], {
    get(target, fn) {
        if (fn === 'push') {
            deferredPromise(target);
        }
        return target[fn];
    }
});
/*

  isDone is not working well


*/
function getTasksToSync(previousTasks) {
    return new Promise((resolve) => {
        previousTasks.forEach((previousTask) => {
            if (previousTask.isDone === true) {
                tasksToSync = tasksToSync.filter((task) => task.id !== previousTask.id);
            }
        });
        deferredPromise = resolve;
    });
}
exports.getTasksToSync = getTasksToSync;
function addTaskToSync(task = {}) {
    task.id = generateId_fn_1.generateId();
    task.isDone = false;
    tasksToSync.push(task);
}
exports.addTaskToSync = addTaskToSync;
