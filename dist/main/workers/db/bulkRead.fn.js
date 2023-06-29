"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initDB_fn_1 = require("./initDB.fn");
function default_1(ids = []) {
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
exports.default = default_1;
