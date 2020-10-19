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
exports.createFilesIndex = exports.readData = exports.addData = exports.index = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var nanoid_1 = require("nanoid");
var nanoid = nanoid_1.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
var json_beautify_1 = __importDefault(require("json-beautify"));
// Max size of knots in bytes.
var maxKnotSize = 250000;
// Root of the DB location.
var dbRootPath = path_1.default.join(__dirname, '../database');
// Index if the found files, this index is the key for the app to work. All the app works with that.
exports.index = [];
// Adds data to the DB.
function addData(collectionName, data) {
    return __awaiter(this, void 0, void 0, function () {
        var foundFile, collectionPath, knot, knotPath, knotData;
        return __generator(this, function (_a) {
            foundFile = readData(collectionName, data['SourceFile']);
            // If the file doesn't exist.
            if (foundFile === undefined) {
                collectionPath = path_1.default.join(dbRootPath, collectionName);
                knot = getKnot(collectionPath);
                knotPath = path_1.default.join(collectionPath, knot);
                knotData = JSON.parse(fs_1.default.readFileSync(knotPath, { encoding: 'utf-8' }));
                // Adds to actual knot ID for easier delete/update operation.
                data = Object.assign(data, { Knot: knot.replace('.knot.json', '') });
                // Adds the new data to the array.
                knotData.push(data);
                // And saves it as a knot file.
                fs_1.default.writeFileSync(knotPath, json_beautify_1.default(knotData, null, 2, 0));
                // If file found and the LastModified field saved in knot doesn't match the current file,
                // it means that the file exists but has been modified since last update.
            }
            else if ((foundFile === null || foundFile === void 0 ? void 0 : foundFile['LastModified']) !== data['LastModified']) {
                // Adds to the new data the found file in knot data like the current ID and Knot ID.
                // The added ID and Knot ID will be used for update/delete operations afterwards.
                Object.assign(data, { Knot: foundFile['Knot'], ID: foundFile['ID'] });
                updateData(collectionName, data);
            }
            return [2 /*return*/];
        });
    });
}
exports.addData = addData;
// Updates data by first deleting from DB and then adding the new data to the DB.
function updateData(collectionName, data) {
    deleteData(collectionName, data);
    addData(collectionName, data);
}
// Deletes given file from the DB
function deleteData(collectionName, data) {
    // Gives knot path.
    var knotPath = path_1.default.join(dbRootPath, collectionName, data['Knot'] + ".knot.json");
    // Gets and parses the knot data from the collection name (knot path).
    var fileData = JSON.parse(fs_1.default.readFileSync(knotPath, { encoding: 'utf-8' }));
    // Filters out from files and index the given data.
    fileData = fileData.filter(function (i) { return i['ID'] !== data['ID']; });
    exports.index = exports.index.filter(function (i) { return i['ID'] !== data['ID']; });
    // Writes back the new data.
    fs_1.default.writeFileSync(knotPath, json_beautify_1.default(fileData, null, 2, 0));
}
// Read Data
function readData(collectionName, id) {
    // If no data found, creates a new index.
    if (exports.index.length === 0) {
        createFilesIndex(collectionName);
    }
    var foundFile = exports.index.find(function (file) { return file['SourceFile'] === id || file['ID'] === id; });
    return foundFile;
}
exports.readData = readData;
function getKnot(collectionPath) {
    var knots = fs_1.default.readdirSync(collectionPath).filter(function (file) { return file.includes('.knot.json'); });
    if (knots.length === 0) {
        return createKnot(collectionPath);
    }
    else {
        var foundKnot = knots.find(function (knot) {
            return fs_1.default.statSync(path_1.default.join(collectionPath, knot)).size < maxKnotSize;
        });
        if (foundKnot) {
            return foundKnot;
        }
        else {
            return createKnot(collectionPath);
        }
    }
}
function createKnot(collectionPath) {
    var idString = nanoid() + ".knot.json";
    fs_1.default.writeFileSync(path_1.default.join(collectionPath, idString), JSON.stringify([]));
    return idString;
}
// Creates an Array of files to be consumed by anything.
function createFilesIndex(collectionName) {
    return new Promise(function (resolve, reject) {
        // Files found array.
        var files = [];
        var collectionPath = path_1.default.join(dbRootPath, collectionName);
        if (!fs_1.default.existsSync(collectionPath)) {
            fs_1.default.mkdirSync(collectionPath);
        }
        var knots = fs_1.default.readdirSync(collectionPath).filter(function (file) { return file.includes('.knot.json'); });
        knots.forEach(function (knot) {
            var fileRaw = fs_1.default.readFileSync(path_1.default.join(collectionPath, knot), { encoding: 'utf-8' });
            try {
                files = files.concat(JSON.parse(fileRaw));
            }
            catch (error) { }
        });
        exports.index = files;
        console.log('------------------ Files Amount:', exports.index.length, '------------------');
        resolve(files);
    });
}
exports.createFilesIndex = createFilesIndex;
