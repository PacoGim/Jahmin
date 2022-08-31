"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(value, decimalPlace = 2) {
    if (!isNaN(Number(value))) {
        value = String(value);
    }
    else {
        return 0;
    }
    let splitValue = value.split('.');
    if (splitValue.length !== 2) {
        return Number(value);
    }
    return Number(`${splitValue[0]}.${splitValue[1].substring(0, decimalPlace)}`);
}
exports.default = default_1;
