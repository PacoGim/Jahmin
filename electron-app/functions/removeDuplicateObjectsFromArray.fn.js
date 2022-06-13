"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(array) {
    return [...new Map(array.map(v => [JSON.stringify(v), v])).values()];
}
exports.default = default_1;
