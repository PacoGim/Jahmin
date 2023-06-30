"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectColumns = exports.selectByIds = exports.selectByKeyValue = void 0;
const initDB_fn_1 = require("./initDB.fn");
function selectByKeyValue(key, value) {
    return new Promise((resolve, reject) => {
        (0, initDB_fn_1.getDb)().get(`SELECT * FROM songs WHERE ${key} = ?`, [value], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}
exports.selectByKeyValue = selectByKeyValue;
function selectByIds(ids = []) {
    return new Promise(resolve => {
        let query = ids.length > 0 ? `SELECT * FROM songs WHERE ID IN (${ids.join(',')})` : `SELECT * FROM songs`;
        (0, initDB_fn_1.getDb)().all(query, [], (err, songs) => {
            if (err) {
                return resolve(null);
            }
            resolve(songs);
        });
    });
}
exports.selectByIds = selectByIds;
function selectColumns(columns = []) {
    return new Promise(resolve => {
        let query = columns.length > 0 ? `SELECT ${columns.join(',')} FROM songs` : `SELECT * FROM songs`;
        (0, initDB_fn_1.getDb)().all(query, [], (err, songs) => {
            if (err) {
                return resolve(null);
            }
            resolve(songs);
        });
    });
}
exports.selectColumns = selectColumns;
