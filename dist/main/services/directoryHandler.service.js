"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = require("./config.service");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const librarySongs_service_1 = require("./librarySongs.service");
function default_1(filePaths, type, dbSongs) {
    let config = (0, config_service_1.getConfig)();
    let foldersToAdd = config.directories.add || [];
    let foldersToExclude = config.directories.exclude || [];
    filePaths.forEach((filePath) => {
        if (type === 'add' && foldersToAdd.includes(filePath) === false) {
            foldersToAdd.push(filePath);
        }
        else if (type === 'exclude' && foldersToExclude.includes(filePath) === false) {
            foldersToExclude.push(filePath);
        }
        else if (type === 'remove-add' && foldersToAdd.includes(filePath) === true) {
            foldersToAdd.splice(foldersToAdd.indexOf(filePath), 1);
        }
        else if (type === 'remove-exclude' && foldersToExclude.includes(filePath) === true) {
            foldersToExclude.splice(foldersToExclude.indexOf(filePath), 1);
        }
    });
    (0, config_service_1.saveConfig)(config);
    (0, sendWebContents_fn_1.default)('selected-directories', config.directories);
    (0, librarySongs_service_1.fetchSongsTag)();
}
exports.default = default_1;
