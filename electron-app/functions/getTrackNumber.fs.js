"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackNumber = void 0;
function getTrackNumber(doc, extension) {
    let trackNumber = undefined;
    if (extension === 'm4a') {
        console.log(doc);
        trackNumber = doc['native']['iTunes'].filter((i) => i['id'] === 'aART').map((i) => i['value']).join('\\\\');
        if (trackNumber)
            return trackNumber;
    }
    return doc['common']['track']['no'] || undefined;
}
exports.getTrackNumber = getTrackNumber;
