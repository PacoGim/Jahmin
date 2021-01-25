"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumArtist = void 0;
function getAlbumArtist(doc, extension) {
    let albumArtist = undefined;
    if (extension === 'm4a') {
        albumArtist = doc['native']['iTunes'].filter((i) => i['id'] === 'aART').map((i) => i['value']).join('\\\\');
        if (albumArtist)
            return albumArtist;
    }
    return doc['common']['albumartist'] || undefined;
}
exports.getAlbumArtist = getAlbumArtist;
