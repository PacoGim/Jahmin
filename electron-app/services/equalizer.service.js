"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEqualizer = exports.addEqualizer = exports.updateEqualizerValues = exports.renameEqualizer = exports.getEqualizers = exports.getEqFolderPath = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const equalizerFile_service_1 = __importDefault(require("./equalizerFile.service"));
const fileExistsWithCaseSync_fn_1 = __importDefault(require("../functions/fileExistsWithCaseSync.fn"));
const eqFolderPath = path_1.default.join((0, __1.appDataPath)(), 'eq');
function getEqFolderPath() {
    return eqFolderPath;
}
exports.getEqFolderPath = getEqFolderPath;
function getEqualizers() {
    let defaultEqualizerPath = path_1.default.join(eqFolderPath, 'Default.txt');
    let equalizers = [];
    if (!fs_1.default.existsSync(eqFolderPath)) {
        fs_1.default.mkdirSync(eqFolderPath);
    }
    let equalizerFilePaths = fs_1.default.readdirSync(eqFolderPath);
    if (!fs_1.default.existsSync(defaultEqualizerPath)) {
        fs_1.default.writeFileSync(defaultEqualizerPath, equalizerFile_service_1.default.stringify(defaultEqualizer));
        equalizers.push(defaultEqualizer);
    }
    equalizerFilePaths.forEach(filePath => {
        if (filePath !== '.DS_Store') {
            let equalizerObject = equalizerFile_service_1.default.parse(fs_1.default.readFileSync(path_1.default.join(eqFolderPath, filePath), { encoding: 'utf8' }));
            equalizerObject.name = filePath.split('.')[0];
            equalizers.push(equalizerObject);
        }
    });
    return equalizers;
}
exports.getEqualizers = getEqualizers;
function renameEqualizer(eqId, newName) {
    let equalizers = getEqualizers();
    let foundEq = equalizers.find(x => x.id === eqId);
    if (foundEq) {
        let newNamePath = path_1.default.join(eqFolderPath, `${newName}.txt`);
        let oldNamePath = path_1.default.join(eqFolderPath, `${foundEq.name}.txt`);
        if ((0, fileExistsWithCaseSync_fn_1.default)(newNamePath)) {
            return {
                code: 'EXISTS',
                message: 'Profile name already exists.'
            };
        }
        try {
            fs_1.default.renameSync(oldNamePath, newNamePath);
            return {
                code: 'OK'
            };
        }
        catch (error) {
            return {
                code: 'EX',
                message: error
            };
        }
    }
    else {
        return {
            code: 'NOT_FOUND',
            message: 'Equalizer not found.'
        };
    }
}
exports.renameEqualizer = renameEqualizer;
function updateEqualizerValues(eqId, newValues) {
    let equalizers = getEqualizers();
    let foundEq = equalizers.find(x => x.id === eqId);
    if (foundEq) {
        foundEq.values = newValues;
        try {
            fs_1.default.writeFileSync(path_1.default.join(eqFolderPath, `${foundEq.name}.txt`), equalizerFile_service_1.default.stringify(foundEq));
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.updateEqualizerValues = updateEqualizerValues;
function addEqualizer(newProfile) {
    if (newProfile.name === '') {
        newProfile.name = 'Noname';
    }
    if (!fs_1.default.existsSync(path_1.default.join(eqFolderPath, `${newProfile.name}.txt`))) {
        try {
            fs_1.default.writeFileSync(path_1.default.join(eqFolderPath, `${newProfile.name}.txt`), equalizerFile_service_1.default.stringify(newProfile));
            return {
                code: 'OK'
            };
        }
        catch (error) {
            return {
                code: 'EX',
                message: error
            };
        }
    }
    else {
        return {
            code: 'EXISTS',
            message: 'Profile name already exists.'
        };
    }
}
exports.addEqualizer = addEqualizer;
function deleteEqualizer(eqId) {
    let equalizers = getEqualizers();
    let foundEq = equalizers.find(x => x.id === eqId);
    if (foundEq) {
        let eqPath = path_1.default.join(eqFolderPath, `${foundEq.name}.txt`);
        if (fs_1.default.existsSync(eqPath)) {
            try {
                fs_1.default.unlinkSync(eqPath);
                return {
                    code: 'OK'
                };
            }
            catch (error) {
                return {
                    code: 'EX',
                    message: error
                };
            }
        }
        else {
            return {
                code: 'NOT_FOUND',
                message: 'Equalizer not found.'
            };
        }
    }
    else {
        return {
            code: 'NOT_FOUND',
            message: 'Equalizer not found.'
        };
    }
}
exports.deleteEqualizer = deleteEqualizer;
let defaultEqualizer = {
    id: 'Default',
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
