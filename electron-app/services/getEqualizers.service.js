"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEqualizers = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const toml_1 = __importDefault(require("@iarna/toml"));
const __1 = require("..");
function getEqualizers() {
    let eqFolderPath = path_1.default.join(__1.appDataPath(), 'eq');
    let equalizerPaths = fs_1.default.readdirSync(eqFolderPath);
    let equalizers = [];
    if (!fs_1.default.existsSync(eqFolderPath)) {
        fs_1.default.mkdirSync(eqFolderPath);
        fs_1.default.writeFileSync(path_1.default.join(eqFolderPath, 'default.toml'), toml_1.default.stringify(defaultEqualizer));
    }
    equalizerPaths.forEach(filePath => {
        if (filePath !== '.DS_Store') {
            equalizers.push(toml_1.default.parse(fs_1.default.readFileSync(path_1.default.join(eqFolderPath, filePath), { encoding: 'utf8' })));
        }
    });
    if (equalizers.length === 0) {
        equalizers.push(defaultEqualizer);
    }
    return equalizers;
}
exports.getEqualizers = getEqualizers;
let defaultEqualizer = {
    id: 'default',
    name: 'Default',
    values: [
        { frequency: 32, gain: 0 },
        { frequency: 64, gain: 0 },
        { frequency: 128, gain: 0 },
        { frequency: 256, gain: 0 },
        { frequency: 512, gain: 0 },
        { frequency: 1024, gain: 0 },
        { frequency: 2048, gain: 0 },
        { frequency: 4096, gain: 0 },
        { frequency: 8192, gain: 0 },
        { frequency: 16384, gain: 0 }
    ]
};
