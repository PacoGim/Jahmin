import { Database } from 'sqlite3'

export default function (db: Database) {
	console.time('Inside Create table fn')
	db.run(`CREATE TABLE IF NOT EXISTS songs (
    ID INTEGER PRIMARY KEY,
    Extension TEXT,
    SourceFile TEXT,
    Album TEXT,
    AlbumArtist TEXT,
    Artist TEXT,
    Comment TEXT,
    Composer TEXT,
    DateYear INTEGER,
    DateMonth INTEGER,
    DiscNumber INTEGER,
    DateDay INTEGER,
    Genre TEXT,
    Rating INTEGER,
    Title TEXT,
    Track INTEGER,
    BitDepth INTEGER,
    BitRate INTEGER,
    Duration INTEGER,
    LastModified INTEGER,
    SampleRate INTEGER,
    Size INTEGER,
    PlayCount INTEGER,
    Directory TEXT,
    IsEnabled INTEGER CHECK (IsEnabled IN (0, 1))
    )`)
	console.timeEnd('Inside Create table fn')
}
