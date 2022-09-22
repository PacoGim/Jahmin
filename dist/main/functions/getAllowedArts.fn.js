"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getFileExtension_fn_1 = __importDefault(require("../functions/getFileExtension.fn"));
const allowedArts_var_1 = require("../global/allowedArts.var");
// Returns all images sorted by priority.
function default_1(rootDir) {
    let allowedArtFiles = fs_1.default
        .readdirSync(rootDir)
        .filter(file => allowedArts_var_1.allowedFiles.includes(file.toLowerCase()))
        .map(file => path_1.default.join(rootDir, file))
        .sort((a, b) => {
        // Gets the priority from the index of the valid formats above.
        // mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
        let aExtension = allowedArts_var_1.validFormats.indexOf((0, getFileExtension_fn_1.default)(a));
        let bExtension = allowedArts_var_1.validFormats.indexOf((0, getFileExtension_fn_1.default)(b));
        return aExtension - bExtension;
    });
    return allowedArtFiles;
}
exports.default = default_1;
