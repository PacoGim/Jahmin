"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_store_1 = require("../stores/main.store");
const _dbObject_1 = require("./!dbObject");
function default_1() {
    return new Promise((resolve, reject) => {
        main_store_1.dbSongsStore.subscribe((songs) => {
            if (songs.length === 0) {
                (0, _dbObject_1.getDB)().songs.toArray().then((songs) => {
                    resolve(songs);
                });
            }
            else {
                resolve(songs);
            }
        })();
    });
}
exports.default = default_1;
