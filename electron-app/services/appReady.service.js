"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendWebContents_service_1 = require("./sendWebContents.service");
let isAppReady = false;
function default_1() {
    if (isAppReady === true) {
        return;
    }
    isAppReady = true;
    (0, sendWebContents_service_1.sendWebContents)('get-all-songs-from-renderer', undefined);
}
exports.default = default_1;
