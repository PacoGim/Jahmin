"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setItemToLocalStorage = exports.getItemFromLocalStorage = void 0;
function getItemFromLocalStorage(key) {
    return new Promise((resolve, reject) => {
        const item = localStorage.getItem(key);
        if (item) {
            resolve(item);
        }
        else {
            reject(new Error(`${key} not found in localStorage`));
        }
    });
}
exports.getItemFromLocalStorage = getItemFromLocalStorage;
function setItemToLocalStorage(key, value) {
    return new Promise((resolve, reject) => {
        localStorage.setItem(key, value);
        resolve();
    });
}
exports.setItemToLocalStorage = setItemToLocalStorage;
