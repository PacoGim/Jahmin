"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(array, key, sortOrder) {
    return array.sort((a, b) => sortOrder.indexOf(a[key]) - sortOrder.indexOf(b[key]));
}
exports.default = default_1;
