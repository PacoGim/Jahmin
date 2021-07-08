"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
function generateId() {
    return BigInt(`${String(Math.random()).substring(2)}${Date.now()}`).toString(36);
}
exports.generateId = generateId;
