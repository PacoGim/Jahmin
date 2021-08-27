"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateId() {
    return BigInt(`${String(Math.random()).substring(2)}${Date.now()}`).toString(36);
}
exports.default = generateId;
