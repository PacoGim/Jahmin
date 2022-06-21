"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
function default_1() {
    let platform = os_1.default.platform();
    if (platform === 'darwin') {
        if (isDarwinM1()) {
            return 'darwin-m1';
        }
        else {
            return 'darwin-intel';
        }
    }
    if (platform === 'win32') {
        return 'win32';
    }
}
exports.default = default_1;
function isDarwinM1() {
    let cpuCore = os_1.default.cpus();
    let isM1 = cpuCore[0].model.includes('Apple');
    return isM1;
}
