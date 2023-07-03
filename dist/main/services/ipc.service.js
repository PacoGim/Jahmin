"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIPC = void 0;
const electron_1 = require("electron");
async function startIPC() {
    /********************** One-way **********************/
    await (await Promise.resolve().then(() => __importStar(require('../ipc/windowResize.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/appReady.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/sendAllSongsToMain.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/showContextMenu.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/savePeaks.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/updateSongs.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/selectDirectories.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/removeDirectory.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/handleArt.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/verifyFolderTegrity.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/reloadApp.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/openGeniusWebpage')))).default(electron_1.ipcMain);
    /********************** Two-way **********************/
    await (await Promise.resolve().then(() => __importStar(require('../ipc/configGet.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/getAlbumColors.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/getPeaks.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/configSave.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/stopSongUpdate.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/rebuildArtCache.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/getArtCacheSize.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/fileExists.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/equalizerAdd.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/equalizersGet.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/equalizerRename.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/equalizerDelete.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/equalizerUpdate.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/getOs.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/getLangFile.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/getCommunityEqualizerProfiles.ipc')))).default(electron_1.ipcMain);
    /********************** Lyrics **********************/
    await (await Promise.resolve().then(() => __importStar(require('../ipc/lyricsSave.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/lyricsGet.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/lyricsListGet.ipc')))).default(electron_1.ipcMain);
    await (await Promise.resolve().then(() => __importStar(require('../ipc/lyricsDelete.ipc')))).default(electron_1.ipcMain);
    /********************** Database **********************/
    await (await Promise.resolve().then(() => __importStar(require('../ipc/database/bulkRead.ipc')))).default(electron_1.ipcMain);
}
exports.startIPC = startIPC;
