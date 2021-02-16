"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteData = exports.updateData = exports.readData = exports.readDataById = exports.createData = exports.getCollection = exports.getDbVersion = exports.setDbVersion = exports.loadDb = exports.getNewPromiseDbVersion = void 0;
const lokijs_1 = __importDefault(require("lokijs"));
//@ts-expect-error
const loki_fs_structured_adapter_1 = __importDefault(require("lokijs/src/loki-fs-structured-adapter"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const index_1 = require("../index");
const ADAPTER = new loki_fs_structured_adapter_1.default();
let db;
let dbVersion = 0;
const COLLECTION_NAME = 'music';
// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve = undefined;
function getNewPromiseDbVersion(rendererDbVersion) {
    // If the db version changed while going back and forth Main <-> Renderer
    if (dbVersion > rendererDbVersion) {
        return new Promise((resolve) => resolve(dbVersion));
    }
    else {
        // If didn't change, when for a change to happen.
        return new Promise((resolve) => (dbVersionResolve = resolve));
    }
}
exports.getNewPromiseDbVersion = getNewPromiseDbVersion;
function loadDb() {
    return new Promise((resolve) => {
        const DB_PATH = path_1.default.join(index_1.appDataPath, '/db');
        if (!fs_1.default.existsSync(DB_PATH)) {
            fs_1.default.mkdirSync(DB_PATH, { recursive: true });
            fs_1.default.writeFile(path_1.default.join(DB_PATH, 'DO_NOT_EDIT_FILES.txt'), 'If you did then delete this folder content and re-scan folders.', () => { });
        }
        db = new lokijs_1.default(path_1.default.join(DB_PATH, 'jahmin.db'), {
            adapter: ADAPTER,
            autoload: true,
            autoloadCallback: () => {
                databaseInitialize().then(() => resolve());
            },
            autosave: true,
            autosaveInterval: 10000
        });
    });
}
exports.loadDb = loadDb;
function setDbVersion(newDbVersion) {
    dbVersion = newDbVersion;
}
exports.setDbVersion = setDbVersion;
function getDbVersion() {
    return dbVersion;
}
exports.getDbVersion = getDbVersion;
function getCollection() {
    const COLLECTION = db.getCollection(COLLECTION_NAME).find();
    return COLLECTION;
}
exports.getCollection = getCollection;
function createData(newDoc) {
    return new Promise((resolve, reject) => {
        try {
            // console.log('New Doc: ', newDoc)
            const COLLECTION = db.getCollection(COLLECTION_NAME);
            if (!COLLECTION)
                throw new Error(`Collection ${COLLECTION_NAME} not created/available.`);
            let oldDoc = readData({ SourceFile: newDoc['SourceFile'] });
            if (oldDoc) {
                resolve(updateData({ $loki: oldDoc['$loki'] }, newDoc));
            }
            else {
                resolve(COLLECTION.insert(newDoc));
                dbVersionResolve(++dbVersion);
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
        const COLLECTION = db.getCollection(COLLECTION_NAME);
        if (!COLLECTION)
            throw new Error(`Collection ${COLLECTION_NAME} not created/available.`);
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
        const COLLECTION = db.getCollection(COLLECTION_NAME);
        if (!COLLECTION)
            throw new Error(`Collection ${COLLECTION_NAME} not created/available.`);
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
            const COLLECTION = db.getCollection(COLLECTION_NAME);
            if (!COLLECTION)
                throw new Error(`Collection ${COLLECTION_NAME} not created/available.`);
            let doc = COLLECTION.find(query)[0];
            doc = deepmerge_1.default(doc, newData);
            resolve(COLLECTION.update(doc));
            dbVersionResolve(++dbVersion);
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
        const COLLECTION = db.getCollection(COLLECTION_NAME);
        if (!COLLECTION)
            throw new Error(`Collection ${COLLECTION_NAME} not created/available.`);
        const DOC = COLLECTION.find(query)[0];
        resolve(COLLECTION.remove(DOC));
        dbVersionResolve(++dbVersion);
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
        let collection = db.getCollection(COLLECTION_NAME);
        if (!collection) {
            db.addCollection(COLLECTION_NAME, {
                unique: ['SourceFile']
            });
        }
        resolve();
    });
}
