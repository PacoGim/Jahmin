"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            name: profile.name,
            values: undefined
        };
        // Verifies if the file is a json file
        if (profile.url.split('/').pop()?.split('.').pop() === 'json') {
            fetch(profile.url)
                .then(res => res.json())
                .then(data => {
                newProfile.values = data.values;
                equalizerProfilesList.push(newProfile);
                getEqualizersFromProfiles(profilesList, equalizerProfilesList);
            });
        }
        else {
            getEqualizersFromProfiles(profilesList, equalizerProfilesList);
        }
    }
    else {
        promiseResolve(equalizerProfilesList);
    }
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
