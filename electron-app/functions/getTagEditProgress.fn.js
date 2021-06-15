"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTagEditProgress = void 0;
const worker_service_1 = require("../services/worker.service");
let worker = worker_service_1.getWorker('tagEdit');
let deferedPromise = undefined;
worker.on('message', (progress) => {
    deferedPromise(progress);
});
function getTagEditProgress() {
    return new Promise((resolve, reject) => {
        worker.postMessage({ message: 'GetProgress' });
        deferedPromise = resolve;
    });
}
exports.getTagEditProgress = getTagEditProgress;
