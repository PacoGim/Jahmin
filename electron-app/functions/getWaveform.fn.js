"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.getWaveform = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const hashString_fn_1 = require("./hashString.fn");
const fs_1 = __importStar(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const __1 = require("..");
const ffmpegPath = path_1.default.join(__dirname, '../binaries/mac', 'ffmpeg');
// const waveformsDirPath = path.join(__dirname, '../waveforms')
function getWaveform(songPath, color) {
    return new Promise((resolve, reject) => {
        let waveformsDirPath = path_1.default.join(__1.appDataPath, 'waveforms');
        if (!fs_1.existsSync(waveformsDirPath)) {
            fs_1.default.mkdirSync(waveformsDirPath, { recursive: true });
        }
        let hashedPath = hashString_fn_1.hash(songPath);
        let fileName = `${color}-${hashedPath}.webp`;
        let waveformPath = path_1.default.join(waveformsDirPath, fileName);
        let folderWatcher = chokidar_1.default.watch(waveformsDirPath, { ignoreInitial: true, awaitWriteFinish: true }).on('add', (path) => {
            if (path === waveformPath) {
                resolve(escape(waveformPath));
                folderWatcher.close();
            }
        });
        child_process_1.exec(`'${ffmpegPath}' -i "${songPath}" -lavfi showwavespic=split_channels=0:s=4000x64:colors=${color}:filter=peak:scale=lin:draw=full '${waveformPath}'`, (error, stdout, stderr) => {
            if (error) {
                console.log('<<<<<<<<<< ERROR >>>>>>>>>>');
                console.log(error);
            }
            if (stdout) {
                console.log('<<<<<<<<<< STDOUT >>>>>>>>>>');
                console.log(stdout);
            }
            if (stderr) {
                console.log('<<<<<<<<<< STDERR >>>>>>>>>>');
            }
        });
    });
}
exports.getWaveform = getWaveform;
