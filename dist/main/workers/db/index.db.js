"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToQueue = exports.init = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sqlite3 = require('sqlite3').verbose();
const numShards = 4;
let db = undefined;
let isQueueRunning = false;
let processDataQueue = [];
function init(appDataPath) {
    const dbPath = path_1.default.join(appDataPath, 'database');
    if (fs_1.default.existsSync(dbPath) === false) {
        fs_1.default.mkdirSync(dbPath);
    }
    // for (let i = 0; i < numShards; i++) {
    // let dbPathChunk = path.resolve(dbPath, `${i}.db`)
    let dbPathChunk = path_1.default.resolve(dbPath, `0.db`);
    db = new sqlite3.Database(dbPathChunk, err => {
        if (err) {
            console.error(err.message);
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS songs (
    ID INTEGER PRIMARY KEY,
    Extension TEXT,
    SourceFile TEXT,
    Album TEXT,
    AlbumArtist TEXT,
    Artist TEXT,
    Comment TEXT,
    Composer TEXT,
    Date_Year INTEGER,
    Date_Month INTEGER,
    DiscNumber INTEGER,
    Date_Day INTEGER,
    Genre TEXT,
    Rating TEXT,
    Title TEXT,
    Track INTEGER,
    BitDepth INTEGER,
    BitRate INTEGER,
    Duration INTEGER,
    LastModified INTEGER,
    SampleRate INTEGER,
    Size INTEGER,
    PlayCount INTEGER
)`);
    // dbs.push(db)
    // }
}
exports.init = init;
function runQueue() {
    let tasks = processDataQueue.map(task => {
        return task.data;
    });
    // console.log(tasks[0])
    /*
     let query = `INSERT INTO songs (
            ID, PlayCount, Album, AlbumArtist, Artist, Composer, Genre, Title, Track, Rating, Comment, DiscNumber, Date_Year, Date_Month, Date_Day, SourceFile, Extension, Size, Duration, SampleRate, LastModified, BitRate, BitDepth, isEnabled, DynamicArtists
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  */
    let placeholders = tasks.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    let query = `INSERT INTO songs (
    ID,
    Extension,
    SourceFile,
    Album,
    AlbumArtist,
    Artist,
    Comment,
    Composer,
    Date_Year,
    Date_Month,
    DiscNumber,
    Date_Day,
    Genre,
    Rating,
    Title,
    Track,
    BitDepth,
    BitRate,
    Duration,
    LastModified,
    SampleRate,
    Size,
    PlayCount) VALUES ${placeholders}`;
    let flatDocuments = tasks.map(doc => Object.values(doc)).flat();
    // console.log(query)
    // console.log(flatDocuments)
    db.run(query, flatDocuments);
    setTimeout(() => {
        db.all(`SELECT * FROM songs`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach(row => {
                console.log(row);
            });
        });
    }, 2000);
}
function addToQueue(data, { at }) {
    if (at === 'end') {
        processDataQueue.push(data);
    }
    else if (at === 'start') {
        processDataQueue.unshift(data);
    }
    if (isQueueRunning === false) {
        isQueueRunning = true;
        setTimeout(() => {
            runQueue();
        }, 2000);
    }
}
exports.addToQueue = addToQueue;
