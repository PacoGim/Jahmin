"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_store_1 = require("../stores/main.store");
let dbVersion = Date.now();
let isVersionUpdating = false;
function default_1() {
    dbVersion = Date.now();
    // Prevents the app from refreshing too often.
    if (isVersionUpdating === false) {
        isVersionUpdating = true;
        updateStoreVersion();
    }
}
exports.default = default_1;
function updateStoreVersion() {
    // Saves the store value locally
    let dbVersionStoreLocal = undefined;
    main_store_1.dbVersionStore.subscribe(value => (dbVersionStoreLocal = value))();
    if (dbVersionStoreLocal !== dbVersion) {
        main_store_1.dbVersionStore.set(dbVersion);
        setTimeout(() => {
            updateStoreVersion();
        }, 250);
    }
    else {
        isVersionUpdating = false;
    }
}
