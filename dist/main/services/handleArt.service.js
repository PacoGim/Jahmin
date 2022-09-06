"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function default_1(imageLocation, elementId, height, width) {
    let isDirectory = fs_1.default.statSync(imageLocation).isDirectory();
    // console.log(imageLocation, elementId, height, width)
}
exports.default = default_1;
