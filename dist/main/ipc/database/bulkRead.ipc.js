"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workers_service_1 = require("../../services/workers.service");
const generateId_fn_1 = __importDefault(require("../../functions/generateId.fn"));
let worker;
(0, workers_service_1.getWorker)('database').then(w => (worker = w));
function default_1(ipcMain) {
    ipcMain.handle('bulk-read', async (evt, data) => {
        data.queryId = (0, generateId_fn_1.default)();
        const result = await new Promise(resolve => {
            worker.on('message', response => {
                if (response.type === 'read') {
                    if (data.queryId === response.results.queryId) {
                        return resolve(response);
                    }
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
