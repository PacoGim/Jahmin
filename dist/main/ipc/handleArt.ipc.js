"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleArt_service_1 = require("../services/handleArt.service");
function default_1(ipcMain) {
    ipcMain.on('handle-art', (event, filePath, elementId, size) => {
        (0, handleArt_service_1.handleArtService)(filePath, elementId, size);
    });
}
exports.default = default_1;
