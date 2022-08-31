"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringHash = require('string-hash');
function default_1(stringToHash, format = 'text') {
    if (format === 'text') {
        return stringHash(stringToHash).toString(36);
    }
    else {
        return stringHash(stringToHash);
    }
}
exports.default = default_1;
