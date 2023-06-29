"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _dbObject_1 = require("./!dbObject");
function default_1(id) {
    (0, _dbObject_1.getDB)()
        .songs.where('ID')
        .equals(id)
        .first()
        .then((song) => {
        song.PlayCount = song.PlayCount !== undefined ? song.PlayCount + 1 : 1;
        (0, _dbObject_1.getDB)()
            .songs.put(song)
            .then(() => /*updateVersionFn()*/ { });
        // <	// Updates the song list to reflect the new play count changes.
        // 	let songListStoreLocal: SongType[] = undefined
        // 	songListStore.subscribe(value => (songListStoreLocal = value))()
        // 	let songFound = songListStoreLocal.find(storeSong => storeSong.ID === song.ID)
        // 	if (songFound) {
        // 		songFound.PlayCount = song.PlayCount
        // 		songListStore.set(songListStoreLocal)
        // 	}>
    });
}
exports.default = default_1;
