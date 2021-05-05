"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveWaveform = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const xxhashjs_1 = require("xxhashjs");
const __1 = require("..");
const hashString_fn_1 = require("./hashString.fn");
function saveWaveform(sourceFile, peaks) {
    const WAVEFORM_DIR = path_1.default.join(__1.appDataPath(), 'waveforms');
    if (!fs_1.default.existsSync(WAVEFORM_DIR)) {
        fs_1.default.mkdirSync(WAVEFORM_DIR);
    }
    let hash = xxhashjs_1.h32().update(fs_1.default.readFileSync(sourceFile)).digest().toString(36);
    fs_1.default.writeFileSync(path_1.default.join(WAVEFORM_DIR, `${hashString_fn_1.hash(sourceFile, 'number')}.txt`), `${hash}\n${JSON.stringify(peaks)}`);
}
exports.saveWaveform = saveWaveform;
