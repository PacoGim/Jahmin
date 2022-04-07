"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = require("./config.service");
const sendWebContents_service_1 = require("./sendWebContents.service");
const songSync_service_1 = require("./songSync.service");
function default_1(filePaths, type) {
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
    (0, sendWebContents_service_1.sendWebContents)('selected-directories', config.directories);
    (0, songSync_service_1.watchFolders)(config.directories);
}
exports.default = default_1;
