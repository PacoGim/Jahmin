"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIPC = void 0;
const electron_1 = require("electron");
const contextMenu_1 = require("../context_menu/contextMenu");
const getAlbumColors_fn_1 = require("../functions/getAlbumColors.fn");
const albumArt_service_1 = require("./albumArt.service");
const handleArt_service_1 = __importDefault(require("./handleArt.service"));
const appReady_service_1 = __importDefault(require("./appReady.service"));
const chokidar_service_1 = require("./chokidar.service");
const compressSingleSongAlbumArt_service_1 = __importDefault(require("./compressSingleSongAlbumArt.service"));
const directoryHandler_service_1 = __importDefault(require("./directoryHandler.service"));
const config_service_1 = require("./config.service");
const equalizer_service_1 = require("./equalizer.service");
const librarySongs_service_1 = require("./librarySongs.service");
const peaks_service_1 = require("./peaks.service");
let saveConfigDebounce;
function startIPC() {
    /********************** One-way **********************/
    electron_1.ipcMain.on('window-resize', event => windowResize(event));
    electron_1.ipcMain.on('app-ready', appReady_service_1.default);
    electron_1.ipcMain.on('send-all-songs-to-main', (evt, songsDb) => (0, librarySongs_service_1.fetchSongsTag)(songsDb));
    electron_1.ipcMain.on('show-context-menu', (evt, menuToOpen, parameters) => (0, contextMenu_1.loadContextMenu)(evt, menuToOpen, parameters));
    electron_1.ipcMain.on('save-peaks', (evt, sourceFile, peaks) => (0, peaks_service_1.savePeaks)(sourceFile, peaks));
    electron_1.ipcMain.on('handle-art-compression', (evt, rootDir, artSize, forceNewCheck) => __awaiter(this, void 0, void 0, function* () { return (0, albumArt_service_1.compressAlbumArt)(rootDir, artSize, forceNewCheck); }));
    electron_1.ipcMain.on('compress-single-song-album-art', (evt, path, albumId, artSize) => __awaiter(this, void 0, void 0, function* () {
        (0, compressSingleSongAlbumArt_service_1.default)(path, artSize, albumId);
    }));
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
    electron_1.ipcMain.on('handle-art', (event, imageLocation, elementId, height, width) => {
        (0, handleArt_service_1.default)(imageLocation, elementId, height, width);
    });
    /********************** Two-way **********************/
    electron_1.ipcMain.handle('get-config', config_service_1.getConfig);
    electron_1.ipcMain.handle('get-album-colors', (evt, rootDir, contrastRatio) => __awaiter(this, void 0, void 0, function* () { return yield (0, getAlbumColors_fn_1.getAlbumColors)(rootDir, contrastRatio); }));
    electron_1.ipcMain.handle('get-peaks', (evt, sourceFile) => __awaiter(this, void 0, void 0, function* () { return yield (0, peaks_service_1.getPeaks)(sourceFile); }));
    electron_1.ipcMain.handle('get-equalizers', (evt) => __awaiter(this, void 0, void 0, function* () { return (0, equalizer_service_1.getEqualizers)(); }));
    electron_1.ipcMain.handle('save-config', (evt, newConfig) => {
        return (0, config_service_1.saveConfig)(newConfig);
    });
    electron_1.ipcMain.handle('add-new-equalizer-profile', (evt, newProfile) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.addEqualizer)(newProfile);
    }));
    electron_1.ipcMain.handle('rename-equalizer', (evt, eqName, newName) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.renameEqualizer)(eqName, newName);
    }));
    electron_1.ipcMain.handle('delete-equalizer', (evt, eqName) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.deleteEqualizer)(eqName);
    }));
    electron_1.ipcMain.handle('update-equalizer-values', (evt, eqName, newValues) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.updateEqualizerValues)(eqName, newValues);
    }));
    electron_1.ipcMain.handle('stop-song-update', (evt) => __awaiter(this, void 0, void 0, function* () {
        return yield (0, librarySongs_service_1.stopSongsUpdating)();
    }));
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
