"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workers_service_1 = require("../../services/workers.service");
let worker;
(0, workers_service_1.getWorker)('database').then(w => (worker = w));
function default_1(ipcMain) {
    ipcMain.handle('bulk-read', async (evt, data) => {
        const result = await new Promise(resolve => {
            worker.on('message', response => {
                if (data.queryId === response.data.queryId) {
                    return resolve(response);
                }
            });
            worker.postMessage({
                type: 'read',
                data
            });
        });
        return result;
    });
}
exports.default = default_1;
