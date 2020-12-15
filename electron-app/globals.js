"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewPromiseAlbumArray = exports.getAlbumArray = exports.setAlbumArray = void 0;
let albumArray = [];
// External resolve. When resolve result set, the promise will be resolved.
let resolvePromise = null;
function setAlbumArray(newAlbumArray) {
    // Saves the new album array for future use.
    albumArray = newAlbumArray;
    //TODO Filtering and stuff
    // Sets the external promise resolve result.
    resolvePromise(newAlbumArray);
}
exports.setAlbumArray = setAlbumArray;
function getAlbumArray() {
    return albumArray;
}
exports.getAlbumArray = getAlbumArray;
// Retuns a new Promise so it can be called anywhere in the app and will be resolved whenever the Promise external resolve is completed.
function getNewPromiseAlbumArray() {
    return new Promise((resolve) => (resolvePromise = resolve));
}
exports.getNewPromiseAlbumArray = getNewPromiseAlbumArray;
