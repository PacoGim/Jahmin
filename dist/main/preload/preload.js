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
    rebuildArtCache,
    saveLyrics,
    getLyrics,
    getLyricsList,
    deleteLyrics,
    getArtCacheSize,
    fileExists,
    getOs,
    getLangFile,
    getCommunityEqualizerProfiles,
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
    verifyFolderTegrity: (folderRoot) => electron_1.ipcRenderer.send('verify-folder-tegrity', folderRoot),
    reloadApp: () => electron_1.ipcRenderer.send('reload-app'),
    openGeniusWebpage: (songTitle, songArtist) => electron_1.ipcRenderer.send('open-genius-webpage', songTitle, songArtist),
    /********************** Main to Renderer **********************/
    onGetAllSongsFromRenderer: (callback) => electron_1.ipcRenderer.on('get-all-songs-from-renderer', callback),
    handleWebStorage: (callback) => electron_1.ipcRenderer.on('web-storage', callback),
    handleNewImageArt: (callback) => electron_1.ipcRenderer.on('new-image-art', callback),
    handleNewVideoArt: (callback) => electron_1.ipcRenderer.on('new-video-art', callback),
    handleNewAnimationArt: (callback) => electron_1.ipcRenderer.on('new-animation-art', callback),
    songSyncQueueProgress: (callback) => electron_1.ipcRenderer.on('song-sync-queue-progress', callback),
    onArtQueueChange: (callback) => electron_1.ipcRenderer.on('art-queue-length', callback),
    onShowLyrics: (callback) => electron_1.ipcRenderer.on('show-lyrics', callback),
    onWebStorageBulkDelete: (callback) => electron_1.ipcRenderer.on('web-storage-bulk-delete', callback),
    onSelectedDirectories: (callback) => electron_1.ipcRenderer.on('selected-directories', callback),
    onAlbumAddToPlayback: (callback) => electron_1.ipcRenderer.on('album-add-to-playback', callback),
    onAlbumPlayAfter: (callback) => electron_1.ipcRenderer.on('album-play-after', callback),
    onAlbumPlayNow: (callback) => electron_1.ipcRenderer.on('album-play-now', callback),
    onSongAddToPlayback: (callback) => electron_1.ipcRenderer.on('song-add-to-playback', callback),
    onSongPlayAfter: (callback) => electron_1.ipcRenderer.on('song-play-after', callback),
    onChangeSongAmount: (callback) => electron_1.ipcRenderer.on('change-song-amount', callback),
    onMediaKeyPressed: (callback) => electron_1.ipcRenderer.on('media-key-pressed', callback),
    onGlobalShortcutsRegistered: (callback) => electron_1.ipcRenderer.on('global-shortcuts-registered', callback),
    onLyricsDeleted: (callback) => electron_1.ipcRenderer.on('lyrics-deleted', callback)
};
electron_1.contextBridge.exposeInMainWorld('ipc', ipcFunctions);
function getCommunityEqualizerProfiles() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-community-equalizer-profiles')
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
function getLangFile() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-lang-file')
            .then(response => resolve(JSON.parse(response)))
            .catch(err => reject(err));
    });
}
function getOs() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-os')
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
function fileExists(filePath) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('file-exists', filePath)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
function deleteLyrics(title, artist) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('delete-lyrics', title, artist)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
function saveLyrics(lyrics, songTile, songArtist) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('save-lyrics', lyrics, songTile, songArtist)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
function getLyrics(songTile, songArtist) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-lyrics', songTile, songArtist)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
function getLyricsList() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-lyrics-list')
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
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
function deleteEqualizer(eqHash) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('delete-equalizer', eqHash)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function updateEqualizerValues(eqHash, newValues) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('update-equalizer-values', eqHash, newValues)
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function renameEqualizer(eqHash, newName) {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('rename-equalizer', eqHash, newName)
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
function rebuildArtCache() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('rebuild-art-cache')
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
function getArtCacheSize() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer
            .invoke('get-art-cache-size')
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}
