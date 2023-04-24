"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEqualizer = exports.addEqualizer = exports.updateEqualizerValues = exports.renameEqualizer = exports.getEqualizers = exports.getEqFolderPath = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const equalizerFile_service_1 = __importDefault(require("./equalizerFile.service"));
const fileExistsWithCaseSync_fn_1 = __importDefault(require("../functions/fileExistsWithCaseSync.fn"));
const getStringHash_fn_1 = __importDefault(require("../functions/getStringHash.fn"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
const eqFolderPath = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'eq');
function getEqFolderPath() {
    return eqFolderPath;
}
exports.getEqFolderPath = getEqFolderPath;
function getEqualizers() {
    let defaultEqualizerPath = path_1.default.join(eqFolderPath, 'Default.json');
    let equalizers = [];
    if (!fs_1.default.existsSync(eqFolderPath)) {
        fs_1.default.mkdirSync(eqFolderPath);
    }
    let equalizerFilePaths = fs_1.default.readdirSync(eqFolderPath).filter(file => file.endsWith('.json'));
    if (!fs_1.default.existsSync(defaultEqualizerPath)) {
        fs_1.default.writeFileSync(defaultEqualizerPath, equalizerFile_service_1.default.stringify(defaultEqualizer));
        equalizers.push(defaultEqualizer);
    }
    equalizerFilePaths.forEach(filePath => {
        let equalizerObject = equalizerFile_service_1.default.parse(fs_1.default.readFileSync(path_1.default.join(eqFolderPath, filePath), { encoding: 'utf8' }));
        if (equalizerObject === null)
            return;
        equalizerObject.type = 'Local';
        equalizers.push(equalizerObject);
    });
    return equalizers;
}
exports.getEqualizers = getEqualizers;
function renameEqualizer(eqName, newName) {
    let equalizers = getEqualizers();
    let foundEq = equalizers.find(x => x.name === eqName);
    if (foundEq) {
        let newNamePath = path_1.default.join(eqFolderPath, `${newName}.json`);
        let oldNamePath = path_1.default.join(eqFolderPath, `${foundEq.name}.json`);
        foundEq.name = newName;
        if ((0, fileExistsWithCaseSync_fn_1.default)(newNamePath)) {
            return {
                code: 'EXISTS',
                message: 'Profile name already exists.'
            };
        }
        try {
            fs_1.default.writeFileSync(newNamePath, equalizerFile_service_1.default.stringify(foundEq));
            fs_1.default.unlinkSync(oldNamePath);
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
function updateEqualizerValues(eqName, newValues) {
    let equalizers = getEqualizers();
    let foundEq = equalizers.find(x => x.name === eqName);
    if (foundEq) {
        foundEq.values = newValues;
        try {
            fs_1.default.writeFileSync(path_1.default.join(eqFolderPath, `${foundEq.name}.json`), equalizerFile_service_1.default.stringify(foundEq));
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
    newProfile.hash = (0, getStringHash_fn_1.default)(newProfile.name + JSON.stringify(newProfile.values));
    if (!fs_1.default.existsSync(path_1.default.join(eqFolderPath, `${newProfile.name}.json`))) {
        try {
            fs_1.default.writeFileSync(path_1.default.join(eqFolderPath, `${newProfile.name}.json`), equalizerFile_service_1.default.stringify(newProfile));
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
function deleteEqualizer(eqName) {
    let equalizers = getEqualizers();
    let foundEq = equalizers.find(x => x.name === eqName);
    if (foundEq) {
        let eqPath = path_1.default.join(eqFolderPath, `${foundEq.name}.json`);
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
    name: 'Default',
    values: {
        '32': 0,
        '64': 0,
        '128': 0,
        '256': 0,
        '512': 0,
        '1024': 0,
        '2048': 0,
        '4096': 0,
        '8192': 0,
        '16384': 0
    },
    hash: '3qu'
};
