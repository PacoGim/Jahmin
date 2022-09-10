"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const path_1 = require("path");
const getOs_fn_1 = __importDefault(require("../functions/getOs.fn"));
const generateId_fn_1 = __importDefault(require("../functions/generateId.fn"));
const fs_1 = __importDefault(require("fs"));
let os /* Operating system */ = (0, getOs_fn_1.default)();
let ffmpegPath = (0, path_1.join)(__dirname, `../../binaries/${os}/ffmpeg`);
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', message => {
    let { artPath, elementId, size, appDataPath } = message;
    let tempFolder = (0, path_1.join)(appDataPath, '/temp');
    let id = (0, generateId_fn_1.default)();
    let tempFilePath = `${tempFolder}/${id}.jpg`;
    if (!fs_1.default.existsSync(tempFolder)) {
        fs_1.default.mkdirSync(tempFolder, { recursive: true });
    }
    (0, child_process_1.spawn)(`"${ffmpegPath}" -i "${artPath}" -vf scale=${size * 2}:${size * 2} "${tempFilePath}"`, [], { shell: true }).on('close', code => {
        if (code === 1) {
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
                artPath,
                elementId,
                artAlt: Buffer.from(fs_1.default.readFileSync(tempFilePath)).toString('base64')
            });
            fs_1.default.unlink(tempFilePath, () => { });
        }
    });
});
