"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumName = void 0;
function getAlbumName(doc, extension) {
    let albumName = undefined;
    if (extension === 'm4a') {
        albumName = doc['native']['iTunes'].find((i) => i['id'] === '©alb');
        if (albumName)
            return albumName['value'];
    }
    return doc['common']['album'] || undefined;
}
exports.getAlbumName = getAlbumName;
