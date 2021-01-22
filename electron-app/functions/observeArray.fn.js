"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeArray = void 0;
function observeArray(arr, toObserve, callback) {
    toObserve.forEach((m) => {
        arr[m] = function () {
            //@ts-ignore
            let res = Array.prototype[m].apply(arr, arguments);
            callback.apply(arr, arguments);
            return res;
        };
    });
}
exports.observeArray = observeArray;
