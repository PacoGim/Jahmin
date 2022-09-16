"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const electron_1 = require("electron");
const fixWindowBoundaries_fn_1 = __importDefault(require("./fixWindowBoundaries.fn"));
const deepmerge = require('deepmerge');
function default_1(config) {
    let options = {
        title: 'Jahmin',
        x: 0,
        y: 0,
        width: 800,
        height: 800,
        backgroundColor: '#1c2128',
        webPreferences: {
            experimentalFeatures: true,
            preload: (0, path_1.join)(__dirname, '../preload/preload.js')
        }
    };
    if (config.bounds !== undefined) {
        const bounds = config.bounds;
        const area = electron_1.screen.getDisplayMatching(bounds).workArea;
        options = deepmerge(options, (0, fixWindowBoundaries_fn_1.default)(bounds, area));
    }
    return options;
}
exports.default = default_1;
