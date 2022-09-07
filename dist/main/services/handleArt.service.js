"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedFiles = exports.handleArtService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const music_metadata_1 = __importDefault(require("music-metadata"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
const getDirectory_fn_1 = __importDefault(require("../functions/getDirectory.fn"));
const getArrayBufferHash_fn_1 = __importDefault(require("../functions/getArrayBufferHash.fn"));
const hashString_fn_1 = __importDefault(require("../functions/hashString.fn"));
const workers_service_1 = require("./workers.service");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const getAllFilesInFoldersDeep_fn_1 = __importDefault(require("../functions/getAllFilesInFoldersDeep.fn"));
const validFormats = ['mp4', 'webm', 'apng', 'avif', 'webp', 'gif', 'svg', 'png', 'jpg', 'jpeg'];
const validNames = ['cover', 'folder', 'front', 'art', 'album'];
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
const extensionsToCompress = ['jpg', 'jpeg', 'png'];
let sharpWorker;
(0, workers_service_1.getWorker)('sharp').then(worker => {
    if (!sharpWorker) {
        sharpWorker = worker;
        sharpWorker.on('message', handleWorkerResponse);
    }
});
function handleWorkerResponse(data) {
    delete data.artData;
    (0, sendWebContents_fn_1.default)('new-art', data);
}
function handleArtService(filePath, elementId, size) {
    if (isNaN(size) || !filePath || !elementId)
        return;
    const isDirectory = fs_1.default.statSync(filePath).isDirectory();
    // If it is a file
    if (!isDirectory) {
        handleFileArt(filePath, elementId, size);
    }
    else {
        handleFolderArt(filePath, elementId, size);
    }
}
exports.handleArtService = handleArtService;
function handleFolderArt(folderPath, elementId, size) {
    let albumId = (0, hashString_fn_1.default)(folderPath);
    let artOutputDirPath = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'arts', String(size));
    let artOutputPath = path_1.default.join(artOutputDirPath, albumId) + '.avif';
    if (!fs_1.default.existsSync(artOutputDirPath))
        fs_1.default.mkdirSync(artOutputDirPath, { recursive: true });
    if (fs_1.default.existsSync(artOutputPath)) {
        (0, sendWebContents_fn_1.default)('new-art', {
            artPath: artOutputPath,
            elementId,
            size
        });
        return;
    }
    let allowedMediaFile = getAllowedFiles(folderPath).sort((fileA, fileB) => fs_1.default.statSync(fileB).size - fs_1.default.statSync(fileA).size)[0] || undefined;
    if (!allowedMediaFile)
        return;
    (0, sendWebContents_fn_1.default)('new-art', {
        artPath: allowedMediaFile,
        elementId,
        size
    });
    let extension = getExtension(allowedMediaFile);
    if (extensionsToCompress.includes(extension)) {
        compressArt(allowedMediaFile, artOutputPath, elementId, size);
    }
}
function handleFileArt(filePath, elementId, size) {
    const fileNameHash = (0, hashString_fn_1.default)(filePath);
    const embeddedArtDirectory = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'arts', 'embedded', String(size));
    if (!fs_1.default.existsSync(embeddedArtDirectory))
        fs_1.default.mkdirSync(embeddedArtDirectory, { recursive: true });
    let embeddedArtPath = (0, getAllFilesInFoldersDeep_fn_1.default)([embeddedArtDirectory])
        .filter(file => !file.endsWith('.avif'))
        .filter(file => !file.endsWith('.DS_Store'))
        .filter(file => file.endsWith(fileNameHash))[0] || undefined;
    if (embeddedArtPath) {
        let finalArtPath = path_1.default.join((0, getDirectory_fn_1.default)(embeddedArtPath), 'cover.avif');
        if (fs_1.default.existsSync(finalArtPath)) {
            (0, sendWebContents_fn_1.default)('new-art', {
                artPath: finalArtPath,
                elementId,
                size
            });
        }
    }
    music_metadata_1.default.parseFile(filePath).then(({ common }) => {
        var _a;
        const cover = music_metadata_1.default.selectCover(common.picture);
        if (cover === null) {
            return handleArtService((0, getDirectory_fn_1.default)(filePath), elementId, size);
        }
        const artHash = (0, getArrayBufferHash_fn_1.default)(cover.data);
        const artDirectory = path_1.default.join(embeddedArtDirectory, artHash);
        if (!fs_1.default.existsSync(artDirectory))
            fs_1.default.mkdirSync(artDirectory, { recursive: true });
        // If the art is the same as the one saved it was already sent before
        if (((_a = embeddedArtPath === null || embeddedArtPath === void 0 ? void 0 : embeddedArtPath.split('/').at(-1)) === null || _a === void 0 ? void 0 : _a.split('.')[0]) === artHash) {
            return;
        }
        else {
            if (embeddedArtPath) {
                fs_1.default.rmSync((0, getDirectory_fn_1.default)(embeddedArtPath), { recursive: true });
            }
        }
        compressArt(cover.data, path_1.default.join(artDirectory, 'cover.avif'), elementId, size);
        fs_1.default.writeFileSync(path_1.default.join(artDirectory, `${artHash}.${fileNameHash}`), '');
    });
}
function compressArt(artData, artPath, elementId, size) {
    sharpWorker.postMessage({
        artData,
        artPath,
        elementId,
        size
    });
}
// Returns all images sorted by priority.
function getAllowedFiles(rootDir) {
    let allowedMediaFiles = fs_1.default
        .readdirSync(rootDir)
        .filter(file => allowedNames.includes(file.toLowerCase()))
        .map(file => path_1.default.join(rootDir, file))
        .sort((a, b) => {
        // Gets the priority from the index of the valid formats above.
        // mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
        let aExtension = validFormats.indexOf(getExtension(a));
        let bExtension = validFormats.indexOf(getExtension(b));
        return aExtension - bExtension;
    });
    return allowedMediaFiles;
}
exports.getAllowedFiles = getAllowedFiles;
function getExtension(data) {
    return data.split('.').pop() || '';
}
