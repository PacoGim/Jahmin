"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getAppDataPath_fn_1 = __importDefault(require("./getAppDataPath.fn"));
const getAllFilesInFoldersDeep_fn_1 = __importDefault(require("./getAllFilesInFoldersDeep.fn"));
function default_1() {
    return new Promise((resolve, reject) => {
        let artFolderPath = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'arts');
        if (fs_1.default.existsSync(artFolderPath)) {
            let files = (0, getAllFilesInFoldersDeep_fn_1.default)([artFolderPath]);
            let sumSizes = 0;
            files.forEach(filePath => {
                sumSizes += fs_1.default.statSync(filePath).size;
            });
            resolve(getSizeUnit(sumSizes));
        }
        else {
            resolve('0 KB');
        }
    });
}
exports.default = default_1;
function getSizeUnit(size) {
    size = Number(size.toFixed(2));
    if (size < 1000) {
        return `${size} B`;
    }
    size = Number((size / 1000).toFixed(2));
    if (size < 1000) {
        return `${size} KB`;
    }
    size = Number((size / 1000).toFixed(2));
    if (size < 1000) {
        return `${size} MB`;
    }
    size = Number((size / 1000).toFixed(2));
    if (size < 1000) {
        return `${size} GB`;
    }
}
