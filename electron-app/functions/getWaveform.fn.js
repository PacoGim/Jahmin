"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveform = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const hashString_fn_1 = require("./hashString.fn");
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
const ffmpegPath = path_1.default.join(__dirname, '../binaries/mac', 'ffmpeg');
const waveformDirPath = path_1.default.join(__dirname, '../waveforms');
function getWaveform(songPath, color) {
    return new Promise((resolve, reject) => {
        let hashedPath = hashString_fn_1.hash(songPath);
        child_process_1.exec(`'${ffmpegPath}' -i '${songPath}' -lavfi showwavespic=split_channels=0:s=4000x64:colors=${color}:filter=peak:scale=lin:draw=full '${waveformDirPath}/${hashedPath}.png'`, (error, stdout, stderr) => {
            let waveformPath = path_1.default.join(waveformDirPath, `${hashedPath}.png`);
            let watcher = chokidar_1.default.watch(waveformDirPath);
            watcher.on('add', (path) => {
                if (path === waveformPath) {
                    resolve(waveformPath);
                    setTimeout(() => {
                        fs_1.default.unlink(waveformPath, () => { });
                        watcher.close();
                    }, 2000);
                }
            });
        });
    });
}
exports.getWaveform = getWaveform;
