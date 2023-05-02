"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getStringHash_fn_1 = __importDefault(require("../functions/getStringHash.fn"));
const jsdom_1 = require("jsdom");
const dompurify_1 = __importDefault(require("dompurify"));
const window = new jsdom_1.JSDOM('').window;
const purify = (0, dompurify_1.default)(window);
let promiseResolve = undefined;
function default_1(ipcMain) {
    ipcMain.handle('get-community-equalizer-profiles', async () => {
        let profilesList = await fetchProfileList();
        let equalizerProfilesList = [];
        return new Promise((resolve, reject) => {
            getEqualizersFromProfiles(profilesList, equalizerProfilesList);
            promiseResolve = resolve;
        }).then(res => {
            return res;
        });
    });
}
exports.default = default_1;
function getEqualizersFromProfiles(profilesList, equalizerProfilesList) {
    let profile = profilesList.shift();
    if (profile) {
        let newProfile = {
            name: '',
            values: undefined
        };
        fetch(profile)
            .then(res => res.json())
            .then(data => {
            newProfile.name = data.name;
            newProfile.values = data.values;
            newProfile.hash = (0, getStringHash_fn_1.default)(newProfile.name + JSON.stringify(newProfile.values));
            newProfile.type = 'Community';
            equalizerProfilesList.push(equalizerProfileSanitize(newProfile));
            getEqualizersFromProfiles(profilesList, equalizerProfilesList);
        });
    }
    else {
        promiseResolve(equalizerProfilesList);
    }
}
function equalizerProfileSanitize(equalizerProfile) {
    let cleanProfile = {
        name: '',
        values: {
            32: 0,
            64: 0,
            128: 0,
            256: 0,
            512: 0,
            1024: 0,
            2048: 0,
            4096: 0,
            8192: 0,
            16384: 0
        }
    };
    let frequencies = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384];
    cleanProfile.name = purify.sanitize(equalizerProfile.name);
    for (let frequency of frequencies) {
        let profileFrequencyValue = equalizerProfile.values?.[frequency];
        if (!isNaN(Number(profileFrequencyValue)) && profileFrequencyValue) {
            if (profileFrequencyValue > 8) {
                cleanProfile.values[frequency] = 8;
            }
            else if (profileFrequencyValue < -8) {
                cleanProfile.values[frequency] = -8;
            }
            else {
                cleanProfile.values[frequency] = profileFrequencyValue;
            }
        }
        else {
            cleanProfile.values[frequency] = 0;
        }
    }
    return cleanProfile;
}
function fetchProfileList() {
    return new Promise((resolve, reject) => {
        fetch('https://raw.githubusercontent.com/PacoGim/Jahmin-Equalizers/main/index.json')
            .then(res => res.json())
            .then(data => {
            resolve(data);
        })
            .catch(err => {
            reject(err);
        });
    });
}
