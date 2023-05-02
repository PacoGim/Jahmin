"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getStringHash_fn_1 = __importDefault(require("../functions/getStringHash.fn"));
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
    return equalizerProfile;
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
