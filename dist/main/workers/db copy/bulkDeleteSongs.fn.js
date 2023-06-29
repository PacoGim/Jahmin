"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_store_1 = require("../stores/main.store");
const _dbObject_1 = require("./!dbObject");
function default_1(songsId) {
    return new Promise((resolve, reject) => {
        (0, _dbObject_1.getDB)()
            .songs.bulkDelete(songsId)
            .then(() => {
            (0, _dbObject_1.getDB)()
                .songs.count()
                .then(count => {
                if (count === 0) {
                    main_store_1.dbSongsStore.set([]);
                }
                // updateVersionFn()
            });
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
