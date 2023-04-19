"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(input) {
    let hash = 0;
    for (let char of input) {
        hash += char.charCodeAt(0);
    }
    return hash.toString(36);
}
exports.default = default_1;
