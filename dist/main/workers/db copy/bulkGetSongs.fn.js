"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _dbObject_1 = require("./!dbObject");
function default_1(ids) {
    return new Promise((resolve, reject) => {
        (0, _dbObject_1.getDB)().songs
            .bulkGet(ids)
            .then(songs => {
            resolve(songs);
        })
            .catch(err => {
            reject(err);
        });
    });
}
exports.default = default_1;
