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
exports.loadIPC = void 0;
const electron_1 = require("electron");
const config_service_1 = require("./config.service");
const albumArt_service_1 = require("./albumArt.service");
const getAlbumColors_fn_1 = require("./getAlbumColors.fn");
const nanoid_1 = require("nanoid");
// import { getTotalChangesToProcess, getTotalProcessedChanged } from './folderWatcher.service'
const hashString_fn_1 = require("../functions/hashString.fn");
const songSync_service_1 = require("./songSync.service");
const peaks_1 = require("./peaks");
const tagEdit_service_1 = require("./tagEdit.service");
// import { getTagEditProgress } from '../functions/getTagEditProgress.fn'
const storage_service_1 = require("./storage.service");
const contextMenu_service_1 = require("./contextMenu.service");
const nanoid = (0, nanoid_1.customAlphabet)('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 20);
const fs_1 = __importDefault(require("fs"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const equalizer_service_1 = require("./equalizer.service");
const common_1 = require("electron/common");
const directoryHandler_service_1 = __importDefault(require("./directoryHandler.service"));
const hashFile_fn_1 = __importDefault(require("../functions/hashFile.fn"));
const appReady_service_1 = __importDefault(require("./appReady.service"));
function loadIPC() {
    electron_1.ipcMain.on('show-context-menu', (event, menuToOpen, parameters) => (0, contextMenu_service_1.loadContextMenu)(event, menuToOpen, parameters));
    electron_1.ipcMain.handle('rename-equalizer', (evt, eqId, newName) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.renameEqualizer)(eqId, newName);
    }));
    electron_1.ipcMain.handle('delete-equalizer', (evt, eqId) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.deleteEqualizer)(eqId);
    }));
    electron_1.ipcMain.handle('update-equalizer-values', (evt, eqId, newValues) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.updateEqualizerValues)(eqId, newValues);
    }));
    electron_1.ipcMain.handle('add-new-equalizer-profile', (evt, newProfile) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.addEqualizer)(newProfile);
    }));
    // ipcMain.handle('group-songs', async (evt, groups: string[], groupValues: string[]) => {
    // 	return groupSongs(groups, groupValues)
    // })
    // ipcMain.handle('get-order', async (evt, arg) => {
    // 	let config = getConfig()
    // 	let grouping = config.order?.grouping || []
    // 	let filtering = config.order?.filtering || []
    // 	let result: any[] = orderSongs(arg, grouping, filtering)
    // 	result = result.map(value => ({
    // 		id: nanoid(),
    // 		value
    // 	}))
    // 	return result
    // })
    electron_1.ipcMain.handle('get-config', (evt, arg) => __awaiter(this, void 0, void 0, function* () {
        let config = (0, config_service_1.getConfig)();
        return config;
    }));
    electron_1.ipcMain.handle('search', (evt, searchString, keys) => __awaiter(this, void 0, void 0, function* () {
        if (keys.includes('Album Artist')) {
            keys.splice(keys.indexOf('Album Artist'), 1);
            keys.push('AlbumArtist');
        }
        const fuse = new fuse_js_1.default((0, storage_service_1.getStorageMapToArray)(), {
            keys
        });
        let result = fuse.search(searchString, { limit: 20 });
        return result;
    }));
    electron_1.ipcMain.handle('get-equalizers', (evt) => __awaiter(this, void 0, void 0, function* () {
        return (0, equalizer_service_1.getEqualizers)();
    }));
    electron_1.ipcMain.handle('save-peaks', (evt, sourceFile, peaks) => __awaiter(this, void 0, void 0, function* () {
        (0, peaks_1.savePeaks)(sourceFile, peaks);
        return '';
    }));
    electron_1.ipcMain.handle('edit-tags', (evt, songList, newTags) => __awaiter(this, void 0, void 0, function* () {
        (0, tagEdit_service_1.tagEdit)(songList, newTags);
        return '';
    }));
    electron_1.ipcMain.handle('get-peaks', (evt, sourceFile) => __awaiter(this, void 0, void 0, function* () {
        return yield (0, peaks_1.getPeaks)(sourceFile);
    }));
    // ipcMain.handle('get-grouping', async (evt, valueToGroupBy) => {
    // 	return groupSongs(valueToGroupBy)
    // })
    electron_1.ipcMain.handle('save-config', (evt, newConfig) => {
        return (0, config_service_1.saveConfig)(newConfig);
    });
    electron_1.ipcMain.handle('open-config', () => {
        // shell.showItemInFolder(configFilePath)
        return;
    });
    electron_1.ipcMain.handle('show-equalizer-folder', () => {
        common_1.shell.openPath((0, equalizer_service_1.getEqFolderPath)());
    });
    electron_1.ipcMain.handle('get-albums', (evt, groupBy, groupByValue) => __awaiter(this, void 0, void 0, function* () {
        let docs = (0, storage_service_1.getStorageMap)();
        let groupedSongs = [];
        docs.forEach(doc => {
            doc.Songs.forEach(song => {
                if (song[groupBy] === groupByValue) {
                    let rootDir = song.SourceFile.split('/').slice(0, -1).join('/');
                    let foundAlbum = groupedSongs.find(i => i['RootDir'] === rootDir);
                    if (!foundAlbum) {
                        groupedSongs.push({
                            ID: (0, hashString_fn_1.hash)(rootDir),
                            RootDir: rootDir,
                            AlbumArtist: song.AlbumArtist,
                            Name: song.Album
                        });
                    }
                }
            });
        });
        return groupedSongs;
    }));
    electron_1.ipcMain.handle('is-file-exist', (evt, filePath) => {
        return fs_1.default.existsSync(filePath);
    });
    electron_1.ipcMain.handle('get-album', (evt, albumID) => {
        return (0, storage_service_1.getStorageMap)().get(albumID);
    });
    /*
    ipcMain.handle('get-art', async (evt, albumId, artSize, elementId) => {
        getAlbumArt(albumId, artSize, elementId)
    })
     */
    electron_1.ipcMain.handle('get-file-hash', (evt, filePath) => __awaiter(this, void 0, void 0, function* () {
        return yield (0, hashFile_fn_1.default)(filePath);
    }));
    electron_1.ipcMain.handle('handle-art-compression', (evt, rootDir, artSize, forceNewCheck) => __awaiter(this, void 0, void 0, function* () {
        (0, albumArt_service_1.compressAlbumArt)(rootDir, artSize, forceNewCheck);
    }));
    electron_1.ipcMain.handle('get-album-colors', (evt, rootDir, contrastRatio) => __awaiter(this, void 0, void 0, function* () {
        return yield (0, getAlbumColors_fn_1.getAlbumColors)(rootDir, contrastRatio);
    }));
    electron_1.ipcMain.handle('sync-db-version', (evt, value) => __awaiter(this, void 0, void 0, function* () {
        return yield (0, storage_service_1.getNewPromiseDbVersion)(value);
    }));
    electron_1.ipcMain.handle('get-changes-progress', (evt) => __awaiter(this, void 0, void 0, function* () {
        return {
            total: (0, songSync_service_1.getMaxTaskQueueLength)(),
            current: (0, songSync_service_1.getTaskQueueLength)()
        };
    }));
    electron_1.ipcMain.handle('get-tag-edit-progress', () => {
        return (0, tagEdit_service_1.getTagEditProgress)();
    });
    electron_1.ipcMain.handle('send-new-art-queue-progress', () => {
        (0, albumArt_service_1.sendArtQueueProgress)();
        return true;
    });
    electron_1.ipcMain.handle('select-directories', (evt, type, dbSongs) => {
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
    electron_1.ipcMain.handle('remove-directory', (evt, directory, type, dbSongs) => {
        (0, directoryHandler_service_1.default)([directory], type, dbSongs);
    });
    electron_1.ipcMain.handle('run-song-fetch', (evt, songDb) => {
        (0, songSync_service_1.watchFolders)(songDb);
    });
    electron_1.ipcMain.handle('app-ready', (evt, songDb) => {
        (0, appReady_service_1.default)();
    });
    electron_1.ipcMain.handle('send-all-songs-from-renderer', (evt, songsDb) => {
        (0, songSync_service_1.watchFolders)(songsDb);
    });
    electron_1.ipcMain.handle('update-songs', (evt, songs, newTags) => {
        songs.forEach(song => {
            (0, songSync_service_1.addToTaskQueue)(song.SourceFile, 'update', newTags);
        });
    });
}
exports.loadIPC = loadIPC;
