"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_store_1 = require("../stores/main.store");
const _dbObject_1 = require("./!dbObject");
const updateVersion_fn_1 = __importDefault(require("./updateVersion.fn"));
function default_1(songsId) {
    return new Promise((resolve, reject) => {
        (0, _dbObject_1.getDB)().songs
            .bulkDelete(songsId)
            .then(() => {
            (0, updateVersion_fn_1.default)();
            (0, _dbObject_1.getDB)().songs.count().then(count => {
                if (count === 0) {
                    main_store_1.dbSongsStore.set([]);
                    (0, updateVersion_fn_1.default)();
                }
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
