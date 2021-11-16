"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeaks = exports.savePeaks = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const xxhashjs_1 = require("xxhashjs");
const __1 = require("..");
const hashString_fn_1 = require("../functions/hashString.fn");
const PEAKS_DIR = path_1.default.join((0, __1.appDataPath)(), 'peaks');
function savePeaks(sourceFile, peaks) {
    if (!fs_1.default.existsSync(PEAKS_DIR)) {
        fs_1.default.mkdirSync(PEAKS_DIR);
    }
    let hash = getSourceFileHash(sourceFile);
    fs_1.default.writeFileSync(getPeakFilePath(sourceFile), `${hash}\n${JSON.stringify(peaks)}`, { encoding: 'utf-8' });
}
exports.savePeaks = savePeaks;
function getPeaks(sourceFile) {
    return new Promise((resolve, reject) => {
        let peaksFilePath = getPeakFilePath(sourceFile);
        if (!fs_1.default.existsSync(peaksFilePath)) {
            return resolve(undefined);
        }
        let peaksFile = fs_1.default.readFileSync(peaksFilePath, 'utf-8');
        // let hash = getSourceFileHash(sourceFile)
        // let peaksFileHash = peaksFile.split('\n')[0]
        let peaks = peaksFile.split('\n')[1];
        resolve(JSON.parse(peaks));
    });
}
exports.getPeaks = getPeaks;
function getSourceFileHash(sourceFile) {
    return (0, xxhashjs_1.h32)().update(fs_1.default.readFileSync(sourceFile)).digest().toString(36);
}
function getPeakFilePath(sourceFile) {
    return path_1.default.join(PEAKS_DIR, `${(0, hashString_fn_1.hash)(sourceFile, 'number')}.txt`);
}
