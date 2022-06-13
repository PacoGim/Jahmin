"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendWebContents_fn_1 = require("../functions/sendWebContents.fn");
let isAppReady = false;
function default_1() {
    if (isAppReady === true) {
        return;
    }
    isAppReady = true;
    (0, sendWebContents_fn_1.sendWebContents)('get-all-songs-from-renderer', undefined);
}
exports.default = default_1;
