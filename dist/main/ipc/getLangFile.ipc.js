"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = require("../services/config.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function default_1(ipcMain) {
    ipcMain.handle('get-lang-file', () => {
        let lang = (0, config_service_1.getConfig)().userOptions.language;
        let langFilePath = path_1.default.join(__dirname, `../i18n/${lang}.json`);
        if (fs_1.default.existsSync(langFilePath)) {
            let langFile = fs_1.default.readFileSync(langFilePath, 'utf8');
            return langFile;
        }
        else {
            return "{}";
        }
    });
}
exports.default = default_1;
