"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workers_service_1 = require("../../services/workers.service");
const generateId_fn_1 = __importDefault(require("../../functions/generateId.fn"));
let worker;
// Get a worker from the workers.service module and assign it to the worker variable
(0, workers_service_1.getWorker)('database').then(w => (worker = w));
function default_1(ipcMain) {
    // Set up an IPC handler for the 'bulk-read' event
    ipcMain.handle('bulk-read', async (evt, data) => {
        // Generate a unique ID for the query
        data.queryId = (0, generateId_fn_1.default)();
        // Create a new Promise to return the result of the read operation
        const result = await new Promise(resolve => {
            // Define a listener function for the 'message' event on the worker
            function listener(response) {
                // Check if the response is of the correct type and if the query IDs match
                if (response.type === 'read') {
                    if (data.queryId === response.results.queryId) {
                        // If they do, remove the listener from the worker and resolve the Promise with the response
                        worker.removeListener('message', listener);
                        return resolve(response);
                    }
                }
            }
            // Add the listener to the worker
            worker.on('message', listener);
            // Send a message to the worker to perform the read operation
            worker.postMessage({
                type: 'read',
                data
            });
        });
        // Return the result of the read operation
        return result;
    });
}
exports.default = default_1;
