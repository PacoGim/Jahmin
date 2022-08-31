"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_store_1 = require("../stores/main.store");
let dbVersion = 0;
let isVersionUpdating = false;
function default_1() {
    dbVersion++;
    if (isVersionUpdating === false) {
        isVersionUpdating = true;
        updateStoreVersion();
    }
}
exports.default = default_1;
function updateStoreVersion() {
    let dbVersionStoreLocal = undefined;
    main_store_1.dbVersionStore.subscribe(value => (dbVersionStoreLocal = value))();
    if (dbVersionStoreLocal !== dbVersion) {
        main_store_1.dbVersionStore.set(dbVersion);
        setTimeout(() => {
            updateStoreVersion();
        }, 500);
    }
    else {
        isVersionUpdating = false;
    }
}
