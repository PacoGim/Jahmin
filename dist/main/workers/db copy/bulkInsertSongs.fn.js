"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _dbObject_1 = require("./!dbObject");
function default_1(songs) {
    return new Promise((resolve, reject) => {
        (0, _dbObject_1.getDB)().songs
            .bulkPut(songs)
            .then(() => {
            // updateVersionFn()
        })
            .catch(err => {
            console.log(err);
        })
            .finally(() => {
            resolve(undefined);
        });
    });
}
exports.default = default_1;
