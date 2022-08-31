"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.setDB = void 0;
let db = undefined;
function setDB(newDb) {
    db = newDb;
}
exports.setDB = setDB;
function getDB() {
    return db;
}
exports.getDB = getDB;
