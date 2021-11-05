"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameObjectKey = void 0;
function renameObjectKey(object, originalKey, newKey) {
    if (object[originalKey] !== undefined) {
        object[newKey] = object[originalKey];
        delete object[originalKey];
    }
}
exports.renameObjectKey = renameObjectKey;
