"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(o) {
    try {
        JSON.stringify(o);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.default = default_1;
