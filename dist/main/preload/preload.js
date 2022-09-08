"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipcFunctions = {
    /********************** Renderer to Main (two-way) **********************/
    getConfig,
    getAlbumColors,
    getPeaks,
    getEqualizers,
    saveConfig,
    addNewEqualizerProfile,
    updateEqualizerValues,
    deleteEqualizer,
    renameEqualizer,
    stopSongUpdate,
    /********************** Renderer to Main (one-way) **********************/
    sendAppReady: () => electron_1.ipcRenderer.send('app-ready'),
    sendAllSongsToMain: (songs) => electron_1.ipcRenderer.send('send-all-songs-to-main', songs),
    showContextMenu: (menuToOpen, parameters) => electron_1.ipcRenderer.send('show-context-menu', menuToOpen, parameters),
    savePeaks: (sourceFile, peaks) => electron_1.ipcRenderer.send('save-peaks', sourceFile, peaks),
    compressAlbumArt: (rootDir, artSize, forceNewCheck) => electron_1.ipcRenderer.send('handle-art-compression', rootDir, artSize, forceNewCheck),
    updateSongs: (songs, newTags) => electron_1.ipcRenderer.send('update-songs', songs, newTags),
    compressSingleSongAlbumArt: (path, artSize, albumId) => electron_1.ipcRenderer.send('compress-single-song-album-art', path, albumId, artSize),
    selectDirectories: (type, songs) => electron_1.ipcRenderer.send('select-directories', type, songs),
    removeDirectory: (directory, type, songs) => electron_1.ipcRenderer.send('remove-directory', directory, type, songs),
    handleArt: (filePath, elementId, size) => electron_1.ipcRenderer.send('handle-art', filePath, elementId, size),
    /********************** Main to Renderer **********************/
    onGetAllSongsFromRenderer: (callback) => electron_1.ipcRenderer.on('get-all-songs-from-renderer', callback),
    handleWebStorage: (callback) => electron_1.ipcRenderer.on('web-storage', callback),
    handleNewImageArt: (callback) => electron_1.ipcRenderer.on('new-image-art', callback),
    handleNewVideoArt: (callback) => electron_1.ipcRenderer.on('new-video-art', callback),
    songSyncQueueProgress: (callback) => electron_1.ipcRenderer.on('song-sync-queue-progress', callback),
    // Gets a Base64 encoded album art
    sendSingleSongArt: (callback) => electron_1.ipcRenderer.on('send-single-song-art', callback)
};
electron_1.contextBridge.exposeInMainWorld('ipc', ipcFunctions);
function getConfig() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-config')
            .then(config => resolve(config))
            .catch(err => reject(err));
    });
}
function getPeaks(sourceFile) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-peaks', sourceFile)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function saveConfig(newConfig) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer.invoke('save-config', newConfig).then(result => {
            resolve(result);
        });
    });
}
function getEqualizers() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer.invoke('get-equalizers').then(result => {
            resolve(result);
        });
    });
}
function getAlbumColors(rootDir, contrastRatio) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-album-colors', rootDir, contrastRatio)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function addNewEqualizerProfile(newProfile) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('add-new-equalizer-profile', newProfile)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function deleteEqualizer(eqName) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('delete-equalizer', eqName)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function updateEqualizerValues(eqName, newValues) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('update-equalizer-values', eqName, newValues)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function renameEqualizer(eqName, newName) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('rename-equalizer', eqName, newName)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function stopSongUpdate() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('stop-song-update')
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
