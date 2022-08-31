"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parse(data) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
}
function stringify(data) {
    return JSON.stringify(data, null, 2);
}
exports.default = {
    parse,
    stringify
};
