"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getAllFilesInFoldersDeep(rootDirectory) {
    let allFiles = [];
    rootDirectory.forEach(rootDirectory => {
        let files = fs_1.default.readdirSync(rootDirectory);
        files.forEach(file => {
            let filePath = path_1.default.join(rootDirectory, file);
            if (fs_1.default.existsSync(filePath) && fs_1.default.statSync(filePath).isDirectory()) {
                allFiles = allFiles.concat(getAllFilesInFoldersDeep([filePath]));
            }
            else {
                allFiles.push(filePath);
            }
        });
    });
    return allFiles;
}
exports.default = getAllFilesInFoldersDeep;
