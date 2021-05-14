"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameObjectKey = void 0;
function renameObjectKey(object, originalKey, newKey) {
    if (object[originalKey]) {
        object[newKey] = object[originalKey];
        delete object[originalKey];
    }
    else {
        console.log(`Orignal Key "${originalKey}" not found in object.`);
    }
}
exports.renameObjectKey = renameObjectKey;
