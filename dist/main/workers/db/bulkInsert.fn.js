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
const initDB_fn_1 = require("./initDB.fn");
const bulkRead_fn_1 = __importDefault(require("./bulkRead.fn"));
const dbVersion_fn_1 = require("./dbVersion.fn");
function default_1(songs) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let ids = songs.map(song => song.ID);
        let foundSongs = (yield (0, bulkRead_fn_1.default)(ids)) || [];
        if (foundSongs !== null && foundSongs.length > 0) {
            let foundIds = foundSongs.map(row => row.ID);
            songs = songs.filter(doc => !foundIds.includes(doc.ID));
        }
        const stmt = (0, initDB_fn_1.getDb)().prepare(`INSERT INTO songs (
      ID, PlayCount, Album, AlbumArtist, Artist, Composer, Genre, Title, Track, Rating, Comment, DiscNumber, Date_Year, Date_Month, Date_Day, SourceFile, Extension, Size, Duration, SampleRate, LastModified, BitRate, BitDepth
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const row of songs) {
            stmt.run(row.ID, row.PlayCount, row.Album, row.AlbumArtist, row.Artist, row.Composer, row.Genre, row.Title, row.Track, row.Rating, row.Comment, row.DiscNumber, row.Date_Year, row.Date_Month, row.Date_Day, row.SourceFile, row.Extension, row.Size, row.Duration, row.SampleRate, row.LastModified, row.BitRate, row.BitDepth);
        }
        stmt.finalize(() => {
            (0, dbVersion_fn_1.updateVersion)();
            resolve(songs);
        });
    }));
}
exports.default = default_1;
