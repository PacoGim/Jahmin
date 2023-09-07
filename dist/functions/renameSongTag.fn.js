"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(tagName) {
    switch (tagName) {
        case 'SampleRate':
            return 'Sample Rate';
        case 'Sample Rate':
            return 'SampleRate';
        case 'PlayCount':
            return 'Play Count';
        case 'Play Count':
            return 'PlayCount';
        default:
            return tagName;
    }
}
exports.default = default_1;
