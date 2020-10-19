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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFolders = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var knotdb_service_1 = require("./knotdb.service");
var nanoid_1 = require("nanoid");
var nanoid = nanoid_1.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
var ExifTool = require('exiftool-vendored').ExifTool;
var exiftool = new ExifTool({ taskTimeoutMillis: 1000 });
var formats = ['.flac', '.m4a', '.mp3', '.wav', '.ogg', '.opus'];
//@ts-expect-error
var filesCollection = [];
// Variable thats keeps the actual folder scan depth.
//@ts-expect-error
var depth = [];
// Variable that keeps the recursivity amount to reactively know when the recursivity is done.
var recursivityControl = 0;
// Main function
function scanFolders(collectionName, rootFolders) {
    console.log("Scanning Folders " + recursivityControl);
    if (rootFolders.length <= 0)
        return;
    var folderPath = rootFolders[0];
    fs_1.default.readdirSync(folderPath + depth.join('/')).forEach(function (item) {
        var fileAbsolutePath = getAbsolutePath(folderPath, item);
        // If item is a Directory and it is NOT a Hidden Folder it adds it to the Depth array to scan it on next recursive call.
        if (fs_1.default.lstatSync(fileAbsolutePath).isDirectory() && !isHiddenFolder(item)) {
            // Adds to the depth array the found directory.
            depth.push('/' + item);
            // Controls recursivity amount to detect when recursivity done.
            recursivityControl++;
            // Recursive Call
            scanFolders(collectionName, rootFolders);
            // Recursivity control when previous recursive call done.
            recursivityControl--;
            // Removes first item of depth control array.
            depth.pop();
        }
        else {
            // If the item is not a folder, then, it only processes the item with the available formats set above.
            if (formats.includes(getExtension(item)))
                filesCollection.push(fileAbsolutePath);
        }
    });
    // If the recursivity control hits 0, then, we are done with the current root folder or all folders.
    if (recursivityControl === 0) {
        // Removes current folder from rootFolders array.
        rootFolders.shift();
        // If more root folders are available, the recursion call restarts. If not, it is done scanning folders.
        if (rootFolders.length > 0) {
            scanFolders(collectionName, rootFolders);
        }
        else {
            console.log('Done ', filesCollection.length);
            getFilesMetaTag(collectionName, filesCollection);
        }
    }
}
exports.scanFolders = scanFolders;
function getFilesMetaTag(collectionName, files) {
    var _this = this;
    console.log('Get Files MetaTag', files);
    var timer = 0;
    var counter = 0;
    setInterval(function () {
        timer++;
    }, 1000);
    files.forEach(function (filePath, index) { return __awaiter(_this, void 0, void 0, function () {
        var file, isDiffTime;
        var _this = this;
        return __generator(this, function (_a) {
            file = undefined;
            isDiffTime = false;
            try {
                file = knotdb_service_1.readData(collectionName, filePath);
            }
            catch (error) { }
            if (file) {
                isDiffTime = fs_1.default.statSync(filePath).mtimeMs !== file['LastModified'];
            }
            if (file === undefined || isDiffTime === true) {
                exiftool
                    .read(filePath)
                    .then(function (tags) { return __awaiter(_this, void 0, void 0, function () {
                    var fileTags, time;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                fileTags = {
                                    ID: nanoid(),
                                    SourceFile: tags['SourceFile'] || '',
                                    FileType: tags['FileType'] || '',
                                    FileSize: tags['FileSize'] || '',
                                    Duration: tags['Duration'] || 0,
                                    Title: tags['Title'] || '',
                                    Artist: tags['Artist'] || '',
                                    Album: tags['Album'] || '',
                                    Genre: tags['Genre'] || '',
                                    Comment: tags['Comment'] || '',
                                    Composer: tags['Composer'] || '',
                                    SampleRate: tags['SampleRate'] || '',
                                    LastModified: fs_1.default.statSync(tags['SourceFile']).mtimeMs,
                                    Knot: ''
                                };
                                if (tags['FileType'] === 'MP3') {
                                    Object.assign(fileTags, {
                                        Track: tags['Track'],
                                        AlbumArtist: tags['Band'],
                                        Date: tags['DateTimeOriginal'],
                                        DiskNumber: tags['PartOfSet'],
                                        BitRate: tags['AudioBitrate']
                                    });
                                }
                                else if (tags['FileType'] === 'M4A') {
                                    Object.assign(fileTags, {
                                        Track: tags['TrackNumber'],
                                        AlbumArtist: tags['AlbumArtist'],
                                        Date: tags['ContentCreateDate'],
                                        DiskNumber: tags['DiskNumber'],
                                        BitRate: tags['AvgBitrate'],
                                        SampleRate: tags['AudioSampleRate'],
                                        BitDepth: tags['AudioBitsPerSample']
                                    });
                                }
                                else if (tags['FileType'] === 'FLAC') {
                                    Object.assign(fileTags, {
                                        Track: tags['TrackNumber'],
                                        AlbumArtist: tags['Albumartist'],
                                        Date: tags['Date'],
                                        DiskNumber: tags['Discnumber'],
                                        BitDepth: tags['BitsPerSample']
                                    });
                                }
                                else if (tags['FileType'] === 'OGG' || tags['FileType'] === 'OPUS') {
                                    Object.assign(fileTags, {
                                        Track: tags['TrackNumber'],
                                        AlbumArtist: tags['Albumartist'],
                                        Date: tags['Date'],
                                        DiskNumber: tags['Discnumber']
                                    });
                                }
                                else if (tags['FileType'] === 'WAV') {
                                    Object.assign(fileTags, {
                                        BitDepth: tags['BitsPerSample']
                                    });
                                }
                                // Adds file metatag to db
                                return [4 /*yield*/, knotdb_service_1.addData(collectionName, fileTags)];
                            case 1:
                                // Adds file metatag to db
                                _a.sent();
                                time = parseTime((files.length / counter) * timer);
                                console.log(Number((100 / files.length) * (counter + 1)).toFixed(2), "% " + (counter + 1) + " out of " + files.length + " Done ", "ETA: " + time + " at " + Math.round(counter / timer) + " files/s");
                                if (files.length === counter + 1) {
                                    console.log('Done');
                                    knotdb_service_1.createFilesIndex(collectionName);
                                }
                                counter++;
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(function (err) { return console.log(filePath, err); });
            }
            else {
                counter++;
            }
            return [2 /*return*/];
        });
    }); });
}
function parseTime(timeInSeconds) {
    if (timeInSeconds >= 3600) {
        return Math.ceil(timeInSeconds / 3600) + "h " + Math.ceil(timeInSeconds % 3600) + "m";
    }
    else {
        return Math.ceil(timeInSeconds / 60) + "m " + Math.ceil(timeInSeconds % 60) + "s";
    }
}
function getAbsolutePath(rootFolderPath, value) {
    return path_1.default.join(rootFolderPath, depth.join('/'), value);
}
function isHiddenFolder(value) {
    if (value.charAt(0) === '.')
        return true;
    else
        return false;
}
function getExtension(value) {
    return path_1.default.extname(value).toLowerCase();
}
