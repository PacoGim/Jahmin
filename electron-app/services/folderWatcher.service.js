"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFolders = exports.getWatcher = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const music_metadata_1 = require("music-metadata");
const fs_1 = __importDefault(require("fs"));
const getGenre_fn_1 = require("../functions/getGenre.fn");
const getComment_fn_1 = require("../functions/getComment.fn");
const getComposer_fn_1 = require("../functions/getComposer.fn");
const getRating_fn_1 = require("../functions/getRating.fn");
const string_hash_1 = __importDefault(require("string-hash"));
const loki_service_1 = require("./loki.service");
const getAlbumName_fn_1 = require("../functions/getAlbumName.fn");
const getTitle_fn_1 = require("../functions/getTitle.fn");
const observeArray_fn_1 = require("../functions/observeArray.fn");
const allowedExtenstions = ['flac', 'm4a', 'mp3'];
let watcher;
function getWatcher() {
    return watcher;
}
exports.getWatcher = getWatcher;
// Array to contain to next song to process, controls excessive I/O
let processQueue = [];
observeArray_fn_1.observeArray(processQueue, ['push'], () => applyFolderChanges());
function applyFolderChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        let changeToApply = processQueue.shift();
        if (changeToApply !== undefined) {
            let { event, path } = changeToApply;
            if (['change', 'add'].includes(event)) {
                let fileToUpdate = yield processedFilePath(path);
                if (fileToUpdate !== undefined) {
                    yield loki_service_1.createData(fileToUpdate);
                }
            }
            else if (['delete'].includes(event)) {
                yield loki_service_1.deleteData({ SourceFile: path });
            }
        }
    });
}
function watchFolders(rootDirectories) {
    let foundFiles = [];
    watcher = chokidar_1.default.watch(rootDirectories, {
        awaitWriteFinish: true
    });
    watcher
        .on('change', (path) => {
        let ext = path.split('.').slice(-1)[0].toLowerCase();
        if (allowedExtenstions.includes(ext)) {
            processQueue.push({
                event: 'update',
                path
            });
        }
    })
        .on('unlink', (path) => {
        let ext = path.split('.').slice(-1)[0].toLowerCase();
        if (allowedExtenstions.includes(ext)) {
            processQueue.push({
                event: 'delete',
                path
            });
        }
    })
        .on('add', (path) => {
        let ext = path.split('.').slice(-1)[0].toLowerCase();
        if (allowedExtenstions.includes(ext)) {
            foundFiles.push(path);
        }
    })
        .on('ready', () => {
        loopFiles(foundFiles);
        watcher.on('add', (path) => {
            let ext = path.split('.').slice(-1)[0].toLowerCase();
            if (allowedExtenstions.includes(ext)) {
                processQueue.push({
                    event: 'add',
                    path
                });
            }
        });
    });
}
exports.watchFolders = watchFolders;
function loopFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        let file = files.shift();
        if (file === undefined) {
            removeDeadFiles();
            return;
        }
        let fileToUpdate = yield processedFilePath(file);
        if (fileToUpdate !== undefined) {
            yield loki_service_1.createData(fileToUpdate);
        }
        setTimeout(() => {
            process.nextTick(() => loopFiles(files));
        }, 1);
    });
}
function processedFilePath(filePath) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const id = string_hash_1.default(filePath);
        const extension = filePath.split('.').pop() || '';
        const fileStats = fs_1.default.statSync(filePath);
        let isFileModified = false;
        let dbDoc = loki_service_1.readData({ ID: id });
        if (dbDoc) {
            if (fileStats.mtimeMs !== dbDoc['LastModified']) {
                isFileModified = true;
            }
        }
        if (dbDoc === undefined || isFileModified === true) {
            resolve(yield getFileMetatag(filePath, id, extension, fileStats));
        }
        else {
            resolve(undefined);
        }
    }));
}
function removeDeadFiles() {
    let collection = loki_service_1.getCollection();
    collection.forEach((song) => {
        if (!fs_1.default.existsSync(song['SourceFile'])) {
            console.log('Delete:', song['SourceFile']);
            loki_service_1.deleteData({ SourceFile: song['SourceFile'] });
        }
    });
}
function getFileMetatag(filePath, id, extension, fileStats) {
    return new Promise((resolve, reject) => {
        music_metadata_1.parseFile(filePath).then((metadata) => {
            let doc = {
                SourceFile: filePath,
                ID: id,
                Extension: extension,
                Size: fileStats.size,
                Duration: metadata['format']['duration'] || 0,
                Title: getTitle_fn_1.getTitle(metadata, extension),
                Artist: metadata['common']['artist'] || undefined,
                Album: getAlbumName_fn_1.getAlbumName(metadata, extension),
                Genre: getGenre_fn_1.getGenre(metadata, extension),
                Comment: getComment_fn_1.getComment(metadata, extension),
                Composer: getComposer_fn_1.getComposer(metadata),
                SampleRate: metadata['format']['sampleRate'] || undefined,
                LastModified: fileStats.mtimeMs || undefined,
                Year: metadata['common']['year'] || undefined,
                Date: metadata['common']['date'] || undefined,
                Track: metadata['common']['track']['no'] || undefined,
                AlbumArtist: metadata['common']['albumartist'] || undefined,
                DiskNumber: metadata['common']['disk']['no'] || undefined,
                BitRate: metadata['format']['bitrate'] || undefined,
                BitDepth: metadata['format']['bitsPerSample'] || undefined,
                Rating: getRating_fn_1.getRating(metadata, extension)
            };
            for (let i in doc) {
                if (doc[i] === undefined) {
                    delete doc[i];
                }
            }
            resolve(doc);
        });
    });
}
