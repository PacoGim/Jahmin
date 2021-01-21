"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenre = void 0;
function getGenre(doc, extension) {
    try {
        if (extension === 'm4a') {
            let genre;
            genre = doc['native']['iTunes'].find((i) => i['id'] === '©gen');
            if (genre === undefined || (genre === null || genre === void 0 ? void 0 : genre['value']) === '') {
                genre = doc['native']['iTunes'].find((i) => i['id'] === 'gnre');
            }
            if (genre)
                return genre['value'];
        }
        let genre = doc['common']['genre'];
        if (typeof genre === 'object')
            genre = genre[0];
        return genre;
    }
    catch (error) {
        console.log(doc);
        return '';
    }
}
exports.getGenre = getGenre;
