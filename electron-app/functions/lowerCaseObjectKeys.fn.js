"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowerCaseObjectKeys = void 0;
function lowerCaseObjectKeys(objectToProcess) {
    let newObject = {};
    for (let key in objectToProcess) {
        newObject[key.toLowerCase()] = objectToProcess[key];
    }
    return newObject;
}
exports.lowerCaseObjectKeys = lowerCaseObjectKeys;
