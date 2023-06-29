"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createTable_fn_1 = __importDefault(require("./createTable.fn"));
const sqlite3 = require('sqlite3').verbose();
let db;
function default_1(appDataPath) {
    const dbPath = path_1.default.join(appDataPath, 'database');
    if (fs_1.default.existsSync(dbPath) === false) {
        fs_1.default.mkdirSync(dbPath);
    }
    // for (let i = 0; i < numShards; i++) {
    // let dbPathChunk = path.resolve(dbPath, `${i}.db`)
    let dbPathChunk = path_1.default.resolve(dbPath, `0.db`);
    db = new sqlite3.Database(dbPathChunk, err => {
        if (err) {
            console.error(err.message);
        }
    });
    (0, createTable_fn_1.default)(db);
}
exports.default = default_1;
function getDb() {
    return db;
}
exports.getDb = getDb;
