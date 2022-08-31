"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _dbObject_1 = require("./!dbObject");
const updateVersion_fn_1 = __importDefault(require("./updateVersion.fn"));
function default_1(songs) {
    return new Promise((resolve, reject) => {
        (0, _dbObject_1.getDB)().songs
            .bulkAdd(songs)
            .then(() => {
            (0, updateVersion_fn_1.default)();
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
