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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveform = exports.getWaveformsFolderWatcher = exports.waveformsFolderWatcher = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const hashString_fn_1 = require("./hashString.fn");
const fs_1 = __importStar(require("fs"));
const __1 = require("..");
const getAlbumColors_fn_1 = require("../services/getAlbumColors.fn");
const hsl_to_hex_1 = __importDefault(require("hsl-to-hex"));
const ffmpegPath = path_1.default.join(__dirname, '../binaries/mac', 'ffmpeg');
function getWaveformsFolderWatcher() {
    return exports.waveformsFolderWatcher;
}
exports.getWaveformsFolderWatcher = getWaveformsFolderWatcher;
function getWaveform(songPath) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let id = hashString_fn_1.hash(songPath.split('/').slice(0, -1).join('/'));
        let colors = yield getAlbumColors_fn_1.getAlbumColors(id);
        let color = hsl_to_hex_1.default(colors.hue, colors.saturation, colors.lightnessLow).replace('#', '');
        let waveformsDirPath = path_1.default.join(__1.appDataPath, 'waveforms');
        if (!fs_1.existsSync(waveformsDirPath)) {
            fs_1.default.mkdirSync(waveformsDirPath, { recursive: true });
        }
        let hashedPath = hashString_fn_1.hash(songPath);
        let fileName = `${color}-${hashedPath}.webp`;
        let waveformPath = path_1.default.join(waveformsDirPath, fileName);
        if (fs_1.default.existsSync(waveformPath)) {
            return resolve(escape(waveformPath));
        }
        child_process_1.exec(`'${ffmpegPath}' -i "${songPath}" -lavfi showwavespic=split_channels=0:s=4000x64:colors=${color}:filter=peak:scale=lin:draw=full '${waveformPath}'`).on('close', () => {
            resolve(escape(waveformPath));
        });
    }));
}
exports.getWaveform = getWaveform;
