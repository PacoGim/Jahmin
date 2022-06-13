"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(path, excludedPaths) {
    let isExcluded = false;
    for (let excludedPath of excludedPaths) {
        if (path.includes(excludedPath)) {
            isExcluded = true;
            break;
        }
    }
    return !isExcluded;
}
exports.default = default_1;
