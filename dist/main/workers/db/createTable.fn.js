"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(db) {
    console.time('Inside Create table fn');
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
    console.timeEnd('Inside Create table fn');
}
exports.default = default_1;
