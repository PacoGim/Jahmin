"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleArtService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const music_metadata_1 = __importDefault(require("music-metadata"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
const getDirectory_fn_1 = __importDefault(require("../functions/getDirectory.fn"));
const getArrayBufferHash_fn_1 = __importDefault(require("../functions/getArrayBufferHash.fn"));
const hashString_fn_1 = __importDefault(require("../functions/hashString.fn"));
const workers_service_1 = require("./workers.service");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const validFormats = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'webp', 'mp4', 'webm'];
const validNames = ['cover', 'folder', 'front', 'art', 'album'];
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
const compress = ['jpg', 'jpeg', 'png'];
const videoFormats = ['mp4', 'webm'];
let sharpWorker;
(0, workers_service_1.getWorker)('sharp').then(worker => {
    sharpWorker = worker;
    sharpWorker.on('message', handleWorkerResponse);
});
function handleWorkerResponse(data) {
    // console.log('Worker Response', data)
    (0, sendWebContents_fn_1.default)('new-art', data);
}
function handleArtService(filePath, elementId, size) {
    if (isNaN(size) || !filePath || !elementId)
        return;
    const isDirectory = fs_1.default.statSync(filePath).isDirectory();
    const artDirectory = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'arts', `${isDirectory ? '' : 'embedded'}`, String(size));
    if (!fs_1.default.existsSync(artDirectory))
        fs_1.default.mkdirSync(artDirectory, { recursive: true });
    // If it is a file
    if (!isDirectory) {
        handleFileArt(filePath, artDirectory, elementId, size);
    }
    /*
                Folder art (url is to directory):
                    How to save:

                    How to recover:


    */
}
exports.handleArtService = handleArtService;
function handleFileArt(filePath, artDirectory, elementId, size) {
    music_metadata_1.default.parseFile(filePath).then(({ common }) => {
        const cover = music_metadata_1.default.selectCover(common.picture);
        if (cover === null) {
            return handleArtService((0, getDirectory_fn_1.default)(filePath), elementId, size);
        }
        let artHash = (0, getArrayBufferHash_fn_1.default)(cover.data);
        let fileNameHash = (0, hashString_fn_1.default)(filePath);
        compressArt(cover.data, path_1.default.join(artDirectory, `${artHash}.avif`), elementId, size);
        fs_1.default.writeFileSync(path_1.default.join(artDirectory, `${artHash}.${fileNameHash}`), '');
    });
    /*
            arts/embedded/64
                28fjf2309123.jpg (Shared cover)
                28fjf2309123.12390viwoivu3283y4o.txt (For this file get that image)
                28fjf2309123.3094yg3fuii287deqqe.txt (For this file get that image)
                28fjf2309123.3op9ug0943jfphsa2vf.txt (For this file get that image)

            Single song art (url is to file):
                How to save:
                    Get the embedded image from file
                        · Send to renderer (end)

                        ·	Hash the image
                            Compress the image
                            Save it as hashed file path + hashed image
                            Send to renderer (end)


                How to recover:
                    Hash the file name
                    Iterate through every embedded images and find the one that includes the hashed
                    Get the image file name
                    Get the image and send it to renderer (end)

                    Get the embeded image from file
                    Hash the image
                    Check if hash matches with file name
                    If hash doesn't match
                    Compress the image
                    Delete all other instances of the image
                    Save it as hashed file path + hashed image
                    Send to renderer (end)

*/
}
function handleFolderArt(filePath, artDirectory, elementId, size) { }
function compressArt(artData, artPath, elementId, size) {
    sharpWorker.postMessage({
        artData,
        artPath,
        elementId,
        size
    });
}
