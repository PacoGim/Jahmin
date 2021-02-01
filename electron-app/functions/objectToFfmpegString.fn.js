"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToFfmpegString = void 0;
function objectToFfmpegString(tags) {
    let finalString = '';
    for (let key in tags) {
        finalString += ` -metadata "${key}=${tags[key]}" `;
    }
    return finalString;
}
exports.objectToFfmpegString = objectToFfmpegString;
