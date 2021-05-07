"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteData = exports.updateData = exports.readData = exports.readDataById = exports.createData = exports.getCollection = exports.getCollectionMap = exports.loadDb = exports.getNewPromiseDbVersion = void 0;
const lokijs_1 = __importDefault(require("lokijs"));
const lokijs_2 = require("lokijs");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const index_1 = require("../index");
const hashString_fn_1 = require("../functions/hashString.fn");
const ADAPTER = new lokijs_2.LokiPartitioningAdapter(new lokijs_2.LokiFsAdapter(), { paging: true, pageSize: 1 * 1024 * 1024 });
const DB_PATH = path_1.default.join(index_1.appDataPath(), '/db');
let db;
let songMap = new Map();
// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve = undefined;
function getDBFileTimeStamp() {
    let filePath = path_1.default.join(DB_PATH, 'jahmin.db');
    if (fs_1.default.existsSync(filePath)) {
        return fs_1.default.statSync(filePath).mtimeMs;
    }
    else {
        return 0;
    }
}
function getNewPromiseDbVersion(rendererDbVersion) {
    let dbFileTimeStamp = getDBFileTimeStamp();
    // If the db version changed while going back and forth Main <-> Renderer
    if (dbFileTimeStamp > rendererDbVersion) {
        return new Promise((resolve) => resolve(dbFileTimeStamp));
    }
    else {
        // If didn't change, wait for a change to happen.
        return new Promise((resolve) => (dbVersionResolve = resolve));
    }
}
exports.getNewPromiseDbVersion = getNewPromiseDbVersion;
function loadDb() {
    return new Promise((resolve) => {
        if (!fs_1.default.existsSync(DB_PATH)) {
            fs_1.default.mkdirSync(DB_PATH, { recursive: true });
            fs_1.default.writeFile(path_1.default.join(DB_PATH, 'DO_NOT_EDIT_FILES.txt'), 'If you did then delete this folder content and re-scan folders.', () => { });
        }
        db = new lokijs_1.default(path_1.default.join(DB_PATH, 'jahmin.db'), {
            adapter: ADAPTER,
            autoload: true,
            autoloadCallback: () => {
                databaseInitialize().then(() => {
                    resolve();
                    mapCollection();
                });
            },
            autosave: true,
            autosaveInterval: 10000,
            autosaveCallback: () => {
                mapCollection();
                dbVersionResolve(getDBFileTimeStamp());
            }
        });
    });
}
exports.loadDb = loadDb;
function getCollectionMap() {
    return songMap;
}
exports.getCollectionMap = getCollectionMap;
function mapCollection() {
    const COLLECTION = db.getCollection('music').find();
    let map = getCollectionMap();
    COLLECTION.forEach((song) => {
        let rootDir = song['SourceFile'].split('/').slice(0, -1).join('/');
        let rootId = hashString_fn_1.hash(rootDir);
        let data = map.get(rootId);
        if (data) {
            if (!data.Songs.find((i) => i.ID === song.ID)) {
                data.Songs.push(song);
                map.set(rootId, data);
            }
        }
        else {
            map.set(rootId, {
                ID: rootId,
                RootDir: rootDir,
                Name: song.Album,
                Songs: [song]
            });
        }
    });
}
function getCollection() {
    const COLLECTION = db.getCollection('music').find();
    return COLLECTION;
}
exports.getCollection = getCollection;
function createData(newDoc) {
    return new Promise((resolve, reject) => {
        try {
            const COLLECTION = db.getCollection('music');
            if (!COLLECTION)
                throw new Error(`Collection music not created/available.`);
            let oldDoc = readData({ SourceFile: newDoc['SourceFile'] });
            if (oldDoc) {
                resolve(updateData({ $loki: oldDoc['$loki'] }, newDoc));
            }
            else {
                resolve(COLLECTION.insert(newDoc));
            }
        }
        catch (error) {
            handleErrors(error);
            resolve(null);
        }
    });
}
exports.createData = createData;
function readDataById(id) {
    try {
        const COLLECTION = db.getCollection('music');
        if (!COLLECTION)
            throw new Error(`Collection ${'music'} not created/available.`);
        return COLLECTION.get(id);
    }
    catch (error) {
        handleErrors(error);
        return null;
    }
}
exports.readDataById = readDataById;
function readData(query) {
    try {
        const COLLECTION = db.getCollection('music');
        if (!COLLECTION)
            throw new Error(`Collection ${'music'} not created/available.`);
        return COLLECTION.find(query)[0];
    }
    catch (error) {
        handleErrors(error);
        return null;
    }
}
exports.readData = readData;
function updateData(query, newData) {
    return new Promise((resolve, reject) => {
        try {
            const COLLECTION = db.getCollection('music');
            if (!COLLECTION)
                throw new Error(`Collection ${'music'} not created/available.`);
            let doc = COLLECTION.find(query)[0];
            doc = deepmerge_1.default(doc, newData);
            resolve(COLLECTION.update(doc));
        }
        catch (error) {
            handleErrors(error);
            return null;
        }
    });
}
exports.updateData = updateData;
function deleteData(query) {
    return new Promise((resolve, reject) => {
        // console.log(query)
        const COLLECTION = db.getCollection('music');
        if (!COLLECTION)
            throw new Error(`Collection ${'music'} not created/available.`);
        const DOC = COLLECTION.find(query)[0];
        resolve(COLLECTION.remove(DOC));
    });
}
exports.deleteData = deleteData;
function handleErrors(error) {
    error = String(error);
    if (error.includes('Duplicate key')) {
        // console.log(error)
    }
    else {
        console.log(error);
    }
}
function databaseInitialize() {
    return new Promise((resolve) => {
        if (!db)
            return;
        let collection = db.getCollection('music');
        if (!collection) {
            db.addCollection('music', {
                unique: ['SourceFile']
            });
        }
        resolve();
    });
}
