"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteData = exports.updateData = exports.readData = exports.readDataById = exports.createData = exports.getCollection = exports.loadDb = void 0;
const lokijs_1 = __importDefault(require("lokijs"));
//@ts-expect-error
const loki_fs_structured_adapter_1 = __importDefault(require("lokijs/src/loki-fs-structured-adapter"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const index_1 = require("../index");
const adapter = new loki_fs_structured_adapter_1.default();
let db;
const collectionName = 'music';
function loadDb() {
    return new Promise((resolve) => {
        const dbPath = path_1.default.join(index_1.appDataPath, '/db');
        if (!fs_1.default.existsSync(dbPath)) {
            fs_1.default.mkdirSync(dbPath, { recursive: true });
            fs_1.default.writeFile(path_1.default.join(dbPath, 'DO_NOT_EDIT_FILES.txt'), 'If you did then delete this folder content and re-scan folders.', () => { });
        }
        db = new lokijs_1.default(path_1.default.join(dbPath, 'jahmin.db'), {
            adapter,
            autoload: true,
            autoloadCallback: () => {
                databaseInitialize().then(() => resolve());
            },
            autosave: true,
            autosaveInterval: 2000
        });
    });
}
exports.loadDb = loadDb;
function getCollection() {
    const collection = db.getCollection(collectionName).find();
    return collection;
}
exports.getCollection = getCollection;
function createData(newDoc) {
    return new Promise((resolve, reject) => {
        try {
            console.log('New Doc: ', newDoc);
            const collection = db.getCollection(collectionName);
            if (!collection)
                throw new Error(`Collection ${collectionName} not created/available.`);
            let oldDoc = readData({ SourceFile: newDoc['SourceFile'] });
            if (oldDoc) {
                resolve(updateData({ $loki: oldDoc['$loki'] }, newDoc));
            }
            else {
                resolve(collection.insert(newDoc));
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
        const collection = db.getCollection(collectionName);
        if (!collection)
            throw new Error(`Collection ${collectionName} not created/available.`);
        return collection.get(id);
    }
    catch (error) {
        handleErrors(error);
        return null;
    }
}
exports.readDataById = readDataById;
function readData(query) {
    try {
        const collection = db.getCollection(collectionName);
        if (!collection)
            throw new Error(`Collection ${collectionName} not created/available.`);
        return collection.find(query)[0];
    }
    catch (error) {
        handleErrors(error);
        return null;
    }
}
exports.readData = readData;
function updateData(query, newData) {
    try {
        const collection = db.getCollection(collectionName);
        if (!collection)
            throw new Error(`Collection ${collectionName} not created/available.`);
        let doc = collection.find(query)[0];
        doc = deepmerge_1.default(doc, newData);
        return collection.update(doc);
    }
    catch (error) {
        handleErrors(error);
        return null;
    }
}
exports.updateData = updateData;
function deleteData(query) {
    return new Promise((resolve, reject) => {
        console.log(query);
        const collection = db.getCollection(collectionName);
        if (!collection)
            throw new Error(`Collection ${collectionName} not created/available.`);
        const doc = collection.find(query)[0];
        resolve(collection.remove(doc));
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
        let collection = db.getCollection(collectionName);
        if (!collection) {
            db.addCollection(collectionName, {
                unique: ['SourceFile']
            });
        }
        resolve();
    });
}
