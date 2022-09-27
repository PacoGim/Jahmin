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
    filePaths.forEach((filePath) => {
        if (type === 'add' && config.directories.add.includes(filePath) === false) {
            config.directories.add.push(filePath);
        }
        else if (type === 'exclude' && config.directories.exclude.includes(filePath) === false) {
            config.directories.exclude.push(filePath);
        }
        else if (type === 'remove-add' && config.directories.add.includes(filePath) === true) {
            config.directories.add.splice(config.directories.add.indexOf(filePath), 1);
        }
        else if (type === 'remove-exclude' && config.directories.exclude.includes(filePath) === true) {
            config.directories.exclude.splice(config.directories.exclude.indexOf(filePath), 1);
        }
    });
    (0, config_service_1.saveConfig)(config);
    (0, sendWebContents_fn_1.default)('selected-directories', config.directories);
    (0, librarySongs_service_1.fetchSongsTag)(dbSongs);
}
exports.default = default_1;