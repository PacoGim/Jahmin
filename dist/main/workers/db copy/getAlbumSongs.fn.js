"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDirectory_fn_1 = __importDefault(require("../functions/getDirectory.fn"));
const getAllSongs_fn_1 = __importDefault(require("./getAllSongs.fn"));
function default_1(rootDir) {
    return new Promise((resolve, reject) => {
        (0, getAllSongs_fn_1.default)().then(songs => {
            resolve(songs.filter(song => (0, getDirectory_fn_1.default)(song.SourceFile) === rootDir));
        });
    });
}
exports.default = default_1;
