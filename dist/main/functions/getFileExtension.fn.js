"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(filePath) {
    let filePathSplit = filePath.split('.');
    if (filePathSplit && filePathSplit.length > 1) {
        let extension = filePathSplit.pop();
        if (extension) {
            return extension.toLowerCase();
        }
    }
    return undefined;
}
exports.default = default_1;
