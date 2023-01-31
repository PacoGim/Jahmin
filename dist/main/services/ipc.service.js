"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIPC = void 0;
const electron_1 = require("electron");
/********************** Functions **********************/
const getAlbumColors_fn_1 = require("../functions/getAlbumColors.fn");
const clearArtCache_fn_1 = __importDefault(require("../functions/clearArtCache.fn"));
const getArtCacheSize_fn_1 = __importDefault(require("../functions/getArtCacheSize.fn"));
const fileExists_fn_1 = __importDefault(require("../functions/fileExists.fn"));
/********************** Services **********************/
const handleArt_service_1 = require("./handleArt.service");
const config_service_1 = require("./config.service");
const equalizer_service_1 = require("./equalizer.service");
const librarySongs_service_1 = require("./librarySongs.service");
const peaks_service_1 = require("./peaks.service");
const lyrics_service_1 = require("./lyrics.service");
/********************** IPC **********************/
const windowResize_ipc_1 = __importDefault(require("../ipc/windowResize.ipc"));
const appReady_ipc_1 = __importDefault(require("../ipc/appReady.ipc"));
const sendAllSongsToMain_ipc_1 = __importDefault(require("../ipc/sendAllSongsToMain.ipc"));
const showContextMenu_ipc_1 = __importDefault(require("../ipc/showContextMenu.ipc"));
const savePeaks_ipc_1 = __importDefault(require("../ipc/savePeaks.ipc"));
const updateSongs_ipc_1 = __importDefault(require("../ipc/updateSongs.ipc"));
const selectDirectories_ipc_1 = __importDefault(require("../ipc/selectDirectories.ipc"));
const removeDirectory_ipc_1 = __importDefault(require("../ipc/removeDirectory.ipc"));
function startIPC() {
    /********************** One-way **********************/
    (0, windowResize_ipc_1.default)(electron_1.ipcMain);
    (0, appReady_ipc_1.default)(electron_1.ipcMain);
    (0, sendAllSongsToMain_ipc_1.default)(electron_1.ipcMain);
    (0, showContextMenu_ipc_1.default)(electron_1.ipcMain);
    (0, savePeaks_ipc_1.default)(electron_1.ipcMain);
    (0, updateSongs_ipc_1.default)(electron_1.ipcMain);
    (0, selectDirectories_ipc_1.default)(electron_1.ipcMain);
    (0, removeDirectory_ipc_1.default)(electron_1.ipcMain);
    electron_1.ipcMain.on('handle-art', (event, filePath, elementId, size) => {
        (0, handleArt_service_1.handleArtService)(filePath, elementId, size);
    });
    /********************** Two-way **********************/
    electron_1.ipcMain.handle('get-config', config_service_1.getConfig);
    electron_1.ipcMain.handle('get-album-colors', async (evt, rootDir, contrastRatio) => await (0, getAlbumColors_fn_1.getAlbumColors)(rootDir, contrastRatio));
    electron_1.ipcMain.handle('get-peaks', async (evt, sourceFile) => await (0, peaks_service_1.getPeaks)(sourceFile));
    electron_1.ipcMain.handle('get-equalizers', async (evt) => (0, equalizer_service_1.getEqualizers)());
    electron_1.ipcMain.handle('save-config', (evt, newConfig) => {
        return (0, config_service_1.saveConfig)(newConfig);
    });
    electron_1.ipcMain.handle('add-new-equalizer-profile', async (evt, newProfile) => {
        return (0, equalizer_service_1.addEqualizer)(newProfile);
    });
    electron_1.ipcMain.handle('rename-equalizer', async (evt, eqName, newName) => {
        return (0, equalizer_service_1.renameEqualizer)(eqName, newName);
    });
    electron_1.ipcMain.handle('delete-equalizer', async (evt, eqName) => {
        return (0, equalizer_service_1.deleteEqualizer)(eqName);
    });
    electron_1.ipcMain.handle('update-equalizer-values', async (evt, eqName, newValues) => {
        return (0, equalizer_service_1.updateEqualizerValues)(eqName, newValues);
    });
    electron_1.ipcMain.handle('stop-song-update', async (evt) => {
        return await (0, librarySongs_service_1.stopSongsUpdating)();
    });
    electron_1.ipcMain.handle('rebuild-art-cache', async (evt) => {
        return await (0, clearArtCache_fn_1.default)();
    });
    electron_1.ipcMain.handle('save-lyrics', async (evt, lyrics, songTile, songArtist) => {
        return await (0, lyrics_service_1.saveLyrics)(lyrics, songTile, songArtist);
    });
    electron_1.ipcMain.handle('get-lyrics', async (evt, songTile, songArtist) => {
        return await (0, lyrics_service_1.getLyrics)(songTile, songArtist);
    });
    electron_1.ipcMain.handle('get-lyrics-list', async () => {
        return await (0, lyrics_service_1.getLyricsList)();
    });
    electron_1.ipcMain.handle('delete-lyrics', async (evt, title, artist) => {
        return await (0, lyrics_service_1.deleteLyrics)(title, artist);
    });
    electron_1.ipcMain.handle('get-art-cache-size', async () => {
        return (0, getArtCacheSize_fn_1.default)();
    });
    electron_1.ipcMain.handle('file-exists', async (evt, filePath) => {
        return (0, fileExists_fn_1.default)(filePath);
    });
}
exports.startIPC = startIPC;
