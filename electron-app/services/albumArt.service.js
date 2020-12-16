"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumCover = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
function getAlbumCover(rootDir) {
    return new Promise((resolve, reject) => {
        fs_1.default.readdirSync(rootDir).forEach((file) => {
            const ext /*extension*/ = file.split('.').pop();
            if (ext === undefined)
                return resolve(null);
            if (validExtensions.includes(ext)) {
                return resolve(path_1.default.join(rootDir, file));
            }
        });
        // If not image were found.
        return resolve(null);
    });
}
exports.getAlbumCover = getAlbumCover;
