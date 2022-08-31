"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeaks = exports.savePeaks = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const xxhashjs_1 = require("xxhashjs");
const hashString_fn_1 = __importDefault(require("../functions/hashString.fn"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
const PEAKS_DIR = path.join((0, getAppDataPath_fn_1.default)(), 'peaks');
function savePeaks(sourceFile, peaks) {
    if (!fs.existsSync(PEAKS_DIR)) {
        fs.mkdirSync(PEAKS_DIR);
    }
    let hash = getSourceFileHash(sourceFile);
    fs.writeFileSync(getPeakFilePath(sourceFile), `${hash}\n${JSON.stringify(peaks)}`, { encoding: 'utf-8' });
}
exports.savePeaks = savePeaks;
function getPeaks(sourceFile) {
    return new Promise((resolve, reject) => {
        let peaksFilePath = getPeakFilePath(sourceFile);
        if (!fs.existsSync(peaksFilePath)) {
            return resolve(undefined);
        }
        let peaksFile = fs.readFileSync(peaksFilePath, 'utf-8');
        // let hash = getSourceFileHash(sourceFile)
        // let peaksFileHash = peaksFile.split('\n')[0]
        let peaks = peaksFile.split('\n')[1];
        resolve(JSON.parse(peaks));
    });
}
exports.getPeaks = getPeaks;
function getSourceFileHash(sourceFile) {
    return (0, xxhashjs_1.h32)().update(fs.readFileSync(sourceFile)).digest().toString(36);
}
function getPeakFilePath(sourceFile) {
    return path.join(PEAKS_DIR, `${(0, hashString_fn_1.default)(sourceFile, 'number')}.txt`);
}
