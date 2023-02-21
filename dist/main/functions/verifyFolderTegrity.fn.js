"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllFilesInFoldersDeep_fn_1 = __importDefault(require("../functions/getAllFilesInFoldersDeep.fn"));
const isAudioFile_fn_1 = __importDefault(require("../functions/isAudioFile.fn"));
const librarySongs_service_1 = require("../services/librarySongs.service");
function default_1(folderRoot) {
    let audioFiles = (0, getAllFilesInFoldersDeep_fn_1.default)([folderRoot]).filter(file => (0, isAudioFile_fn_1.default)(file));
    audioFiles.forEach(filePath => {
        (0, librarySongs_service_1.addToTaskQueue)(filePath, 'insert');
    });
}
exports.default = default_1;
