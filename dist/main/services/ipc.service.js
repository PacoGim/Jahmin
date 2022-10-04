"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIPC = void 0;
const electron_1 = require("electron");
const contextMenu_1 = require("../context_menu/contextMenu");
/********************** Functions **********************/
const getAlbumColors_fn_1 = require("../functions/getAlbumColors.fn");
const clearArtCache_fn_1 = __importDefault(require("../functions/clearArtCache.fn"));
/********************** Services **********************/
const handleArt_service_1 = require("./handleArt.service");
const appReady_service_1 = __importDefault(require("./appReady.service"));
const chokidar_service_1 = require("./chokidar.service");
const directoryHandler_service_1 = __importDefault(require("./directoryHandler.service"));
const config_service_1 = require("./config.service");
const equalizer_service_1 = require("./equalizer.service");
const librarySongs_service_1 = require("./librarySongs.service");
const peaks_service_1 = require("./peaks.service");
const lyrics_service_1 = require("./lyrics.service");
let saveConfigDebounce;
function startIPC() {
    /********************** One-way **********************/
    electron_1.ipcMain.on('window-resize', event => windowResize(event));
    electron_1.ipcMain.on('app-ready', appReady_service_1.default);
    electron_1.ipcMain.on('send-all-songs-to-main', (evt, songsDb) => (0, librarySongs_service_1.fetchSongsTag)(songsDb));
    electron_1.ipcMain.on('show-context-menu', (evt, menuToOpen, parameters) => (0, contextMenu_1.loadContextMenu)(evt, menuToOpen, parameters));
    electron_1.ipcMain.on('save-peaks', (evt, sourceFile, peaks) => (0, peaks_service_1.savePeaks)(sourceFile, peaks));
    // ipcMain.on('compress-single-song-album-art', async (evt, path, albumId, artSize) => {
    // 	compressSingleSongAlbumArtService(path, artSize, albumId)
    // })
    electron_1.ipcMain.on('update-songs', (evt, songs, newTags) => {
        let sourceFiles = songs.map(song => song.SourceFile);
        (0, chokidar_service_1.unwatchPaths)(sourceFiles);
        songs.forEach(song => {
            (0, librarySongs_service_1.addToTaskQueue)(song.SourceFile, 'update', newTags);
        });
    });
    electron_1.ipcMain.on('select-directories', (evt, type, dbSongs) => {
        electron_1.dialog
            .showOpenDialog({
            properties: ['openDirectory', 'multiSelections']
        })
            .then(result => {
            if (result.canceled === false) {
                (0, directoryHandler_service_1.default)(result.filePaths, type, dbSongs);
            }
        })
            .catch(err => {
            console.log(err);
        });
    });
    electron_1.ipcMain.on('remove-directory', (evt, directory, type, dbSongs) => {
        (0, directoryHandler_service_1.default)([directory], type, dbSongs);
    });
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
}
exports.startIPC = startIPC;
function windowResize(event) {
    let window = electron_1.BrowserWindow.fromId(event.frameId);
    if (window === null)
        return;
    clearTimeout(saveConfigDebounce);
    saveConfigDebounce = setTimeout(() => {
        (0, config_service_1.saveConfig)({
            bounds: {
                x: window.getPosition()[0],
                y: window.getPosition()[1],
                width: window.getSize()[0],
                height: window.getSize()[1]
            }
        });
    }, 250);
}
