"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComposer = void 0;
function getComposer(doc) {
    try {
        let composer = doc['common']['composer'];
        if (typeof composer === 'object')
            composer = composer[0];
        return composer;
    }
    catch (error) {
        return '';
    }
}
exports.getComposer = getComposer;
