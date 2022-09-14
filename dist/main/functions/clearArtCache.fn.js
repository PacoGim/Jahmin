"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getAppDataPath_fn_1 = __importDefault(require("./getAppDataPath.fn"));
function default_1() {
    return new Promise(resolve => {
        let artPath = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'arts');
        if (fs_1.default.existsSync(artPath)) {
            fs_1.default.rm(artPath, { recursive: true }, () => {
                resolve(true);
            });
        }
        else {
            resolve(false);
        }
    });
}
exports.default = default_1;
