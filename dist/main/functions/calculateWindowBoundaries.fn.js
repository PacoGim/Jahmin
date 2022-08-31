"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fixWindowBoundaries_fn_1 = __importDefault(require("./fixWindowBoundaries.fn"));
const saveWindowResize_fn_1 = __importDefault(require("./saveWindowResize.fn"));
let processDebounce;
function default_1(browserWindow) {
    clearTimeout(processDebounce);
    processDebounce = setTimeout(() => {
        let x = browserWindow.getPosition()[0];
        let y = browserWindow.getPosition()[1];
        let width = browserWindow.getSize()[0];
        let height = browserWindow.getSize()[1];
        let workArea = electron_1.screen.getDisplayMatching({
            x,
            y,
            width,
            height
        }).workArea;
        (0, saveWindowResize_fn_1.default)((0, fixWindowBoundaries_fn_1.default)({ x, y, height, width }, workArea));
    }, 1000);
}
exports.default = default_1;
