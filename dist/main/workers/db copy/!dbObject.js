"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.setDB = void 0;
const store_1 = require("svelte/store");
const getDirectory_fn_1 = __importDefault(require("../functions/getDirectory.fn"));
const sortSongsArray_fn_1 = __importDefault(require("../functions/sortSongsArray.fn"));
const stopSong_fn_1 = __importDefault(require("../functions/stopSong.fn"));
const config_store_1 = require("../stores/config.store");
const main_store_1 = require("../stores/main.store");
let db = undefined;
// let configLocal: ConfigType = undefined
// config.subscribe(value => (configLocal = value))
function setDB(newDb) {
    db = newDb;
    db.on('changes', changes => {
        changes.forEach(_ => {
            if (_.type === 2 /* Type 2 === Update */) {
                updateData(_.obj);
            }
            else if (_.type === 3 /* Type 3 === Delete */) {
                deleteData(_.oldObj);
            }
            else if (_.type === 1 /* Type 1 === Insert */) {
                insertData(_.obj);
            }
        });
    });
}
exports.setDB = setDB;
function insertData(newObjet) {
    let selectedAlbumDirLocal = undefined;
    let songListStoreLocal = undefined;
    main_store_1.selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))();
    if (selectedAlbumDirLocal === (0, getDirectory_fn_1.default)(newObjet === null || newObjet === void 0 ? void 0 : newObjet.SourceFile)) {
        main_store_1.songListStore.subscribe(value => (songListStoreLocal = value))();
        songListStoreLocal.push(newObjet);
        main_store_1.songListStore.set((0, sortSongsArray_fn_1.default)(songListStoreLocal, (0, store_1.get)(config_store_1.config).userOptions.sortBy, (0, store_1.get)(config_store_1.config).userOptions.sortOrder, (0, store_1.get)(config_store_1.config).group));
    }
}
function deleteData(oldObject) {
    let selectedAlbumDirLocal = undefined;
    let songListStoreLocal = undefined;
    let playingSongLocal = undefined;
    main_store_1.selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))();
    if (selectedAlbumDirLocal === (0, getDirectory_fn_1.default)(oldObject === null || oldObject === void 0 ? void 0 : oldObject.SourceFile)) {
        main_store_1.songListStore.subscribe(value => (songListStoreLocal = value))();
        let itemToDeleteIndex = songListStoreLocal.findIndex(song => song.ID === oldObject.ID);
        if (itemToDeleteIndex !== -1) {
            songListStoreLocal.splice(itemToDeleteIndex, 1);
            main_store_1.songListStore.set(songListStoreLocal);
            main_store_1.playingSongStore.subscribe(value => (playingSongLocal = value))();
            if (oldObject.ID === (playingSongLocal === null || playingSongLocal === void 0 ? void 0 : playingSongLocal.ID)) {
                (0, stopSong_fn_1.default)();
            }
        }
    }
}
function updateData(newObjet) {
    let songListStoreLocal = undefined;
    let selectedAlbumDirLocal = undefined;
    main_store_1.selectedAlbumDir.subscribe(value => (selectedAlbumDirLocal = value))();
    if (selectedAlbumDirLocal === (0, getDirectory_fn_1.default)(newObjet === null || newObjet === void 0 ? void 0 : newObjet.SourceFile)) {
        main_store_1.songListStore.subscribe(value => (songListStoreLocal = value))();
        let songIndex = songListStoreLocal.findIndex(song => newObjet.ID === song.ID);
        songListStoreLocal[songIndex] = newObjet;
        main_store_1.songListStore.set((0, sortSongsArray_fn_1.default)(songListStoreLocal, (0, store_1.get)(config_store_1.config).userOptions.sortBy, (0, store_1.get)(config_store_1.config).userOptions.sortOrder, (0, store_1.get)(config_store_1.config).group));
    }
}
function getDB() {
    return db;
}
exports.getDB = getDB;
