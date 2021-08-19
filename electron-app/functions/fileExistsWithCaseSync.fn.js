"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function fileExistsWithCaseSync(filepath) {
    let dir = path_1.default.dirname(filepath);
    if (dir === path_1.default.dirname(dir)) {
        return true;
    }
    let filenames = fs_1.default.readdirSync(dir);
    if (filenames.indexOf(path_1.default.basename(filepath)) === -1) {
        return false;
    }
    return fileExistsWithCaseSync(dir);
}
exports.default = fileExistsWithCaseSync;
