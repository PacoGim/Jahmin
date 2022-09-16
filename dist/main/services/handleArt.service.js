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
const videoFormats = ['mp4', 'webm'];
const animatedFormats = ['apng', 'avif', 'webp', 'gif'];
const vectorFormats = ['svg'];
const imageFormats = ['png', 'jpg', 'jpeg'];
const validFormats = [...videoFormats, ...animatedFormats, ...vectorFormats, ...imageFormats];
const validNames = ['cover', 'folder', 'front', 'art', 'album'];
const allowedFiles = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
let sharpWorker;
(0, workers_service_1.getWorker)('sharp').then(worker => {
    if (!sharpWorker) {
        sharpWorker = worker;
        sharpWorker.on('message', handleSharpWorkerResponse);
    }
});
let ffmpegImageWorker;
(0, workers_service_1.getWorker)('ffmpegImage').then(worker => {
    if (!ffmpegImageWorker) {
        ffmpegImageWorker = worker;
        ffmpegImageWorker.on('message', handleFfmpegImageWorkerResponse);
    }
});
function handleSharpWorkerResponse(data) {
    delete data.artData;
    (0, sendWebContents_fn_1.default)('new-image-art', data);
}
function handleFfmpegImageWorkerResponse(data) {
    (0, sendWebContents_fn_1.default)('new-animation-art', data);
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
    let artOutputPath = path_1.default.join(artOutputDirPath, albumId) + '.webp';
    if (!fs_1.default.existsSync(artOutputDirPath))
        fs_1.default.mkdirSync(artOutputDirPath, { recursive: true });
    if (fs_1.default.existsSync(artOutputPath)) {
        (0, sendWebContents_fn_1.default)('new-image-art', {
            artPath: artOutputPath,
            elementId
        });
        return;
    }
    let allowedArtFiles = getAllowedFiles(folderPath);
    let videoArts = allowedArtFiles.filter(file => videoFormats.includes(getExtension(file)));
    let animatedArts = allowedArtFiles.filter(file => animatedFormats.includes(getExtension(file)));
    let imageArts = allowedArtFiles.filter(file => imageFormats.includes(getExtension(file)));
    if (videoArts.length !== 0) {
        return handleFolderVideoArt(videoArts, elementId);
    }
    if (animatedArts.length !== 0) {
        return handleFolderAnimatedArt(animatedArts, elementId, size);
    }
    if (imageArts.length !== 0) {
        return handleFolderImageArt(imageArts, artOutputPath, elementId, size);
    }
    (0, sendWebContents_fn_1.default)('new-image-art', {
        artPath: null,
        elementId
    });
}
function handleFolderImageArt(artPaths, artOutputPath, elementId, size) {
    let bestArtFile = artPaths.sort((fileA, fileB) => fs_1.default.statSync(fileB).size - fs_1.default.statSync(fileA).size)[0] || undefined;
    if (!bestArtFile) {
        (0, sendWebContents_fn_1.default)('new-image-art', {
            artPath: null,
            elementId
        });
        return;
    }
    (0, sendWebContents_fn_1.default)('new-image-art', {
        artPath: bestArtFile,
        elementId
    });
    let extension = getExtension(bestArtFile);
    if (imageFormats.includes(extension)) {
        compressArt(bestArtFile, artOutputPath, elementId, size);
    }
}
function handleFolderVideoArt(artPaths, elementId) {
    let artPath = artPaths[0];
    if (artPath !== undefined) {
        (0, sendWebContents_fn_1.default)('new-video-art', {
            artPath,
            elementId
        });
    }
    else {
        (0, sendWebContents_fn_1.default)('new-video-art', {
            artPath: null,
            elementId
        });
    }
}
function handleFolderAnimatedArt(artPaths, elementId, size) {
    let artPath = artPaths[1];
    if (artPath) {
        (0, sendWebContents_fn_1.default)('new-animation-art', {
            artPath: artPaths[1],
            elementId
        });
        ffmpegImageWorker.postMessage({
            artPath: artPaths[1],
            elementId,
            size,
            appDataPath: (0, getAppDataPath_fn_1.default)()
        });
    }
    else {
        (0, sendWebContents_fn_1.default)('new-animation-art', {
            artPath: null,
            elementId
        });
    }
}
function handleFileArt(filePath, elementId, size) {
    const fileNameHash = (0, hashString_fn_1.default)(filePath);
    const embeddedArtDirectory = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'arts', 'embedded', String(size));
    if (!fs_1.default.existsSync(embeddedArtDirectory))
        fs_1.default.mkdirSync(embeddedArtDirectory, { recursive: true });
    let embeddedArtPath = (0, getAllFilesInFoldersDeep_fn_1.default)([embeddedArtDirectory])
        .filter(file => !file.endsWith('.webp'))
        .filter(file => !file.endsWith('.DS_Store'))
        .filter(file => file.endsWith(fileNameHash))[0] || undefined;
    if (embeddedArtPath) {
        let finalArtPath = path_1.default.join((0, getDirectory_fn_1.default)(embeddedArtPath), 'cover.webp');
        if (fs_1.default.existsSync(finalArtPath)) {
            (0, sendWebContents_fn_1.default)('new-image-art', {
                artPath: finalArtPath,
                elementId
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
        compressArt(cover.data, path_1.default.join(artDirectory, 'cover.webp'), elementId, size);
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
    let allowedArtFiles = fs_1.default
        .readdirSync(rootDir)
        .filter(file => allowedFiles.includes(file.toLowerCase()))
        .map(file => path_1.default.join(rootDir, file))
        .sort((a, b) => {
        // Gets the priority from the index of the valid formats above.
        // mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
        let aExtension = validFormats.indexOf(getExtension(a));
        let bExtension = validFormats.indexOf(getExtension(b));
        return aExtension - bExtension;
    });
    return allowedArtFiles;
}
exports.getAllowedFiles = getAllowedFiles;
function getExtension(data) {
    return data.split('.').pop() || '';
}
