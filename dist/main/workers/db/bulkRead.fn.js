"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectColumns = exports.selectByIds = exports.selectGeneric = void 0;
const initDB_fn_1 = require("./initDB.fn");
function selectGeneric(queryData) {
    return new Promise((resolve, reject) => {
        let sqliteQuery = buildSqliteQuery(queryData);
        (0, initDB_fn_1.getDb)().all(sqliteQuery, [], (err, songs) => {
            if (err) {
                return reject(err);
            }
            resolve({
                queryId: queryData.queryId,
                data: songs
            });
        });
    });
}
exports.selectGeneric = selectGeneric;
function buildSqliteQuery(queryData) {
    let query = `SELECT ${queryData.select.join(',')} FROM songs`;
    if (queryData.where) {
        query += ` WHERE ${queryData.where
            .map(where => {
            if (where[Object.keys(where)[0]] === 'not null') {
                return `${Object.keys(where)[0]} is not null`;
            }
            else {
                return `${Object.keys(where)[0]} = "${where[Object.keys(where)[0]]}"`;
            }
        })
            .join(' AND ')}`;
    }
    if (queryData.group) {
        query += ` GROUP BY ${queryData.group.join(',')}`;
    }
    if (queryData.order) {
        query += ` ORDER BY ${queryData.order.join(',')}`;
    }
    return query;
}
function selectByIds(ids = []) {
    return new Promise(resolve => {
        let query = ids.length > 0 ? `SELECT * FROM songs WHERE ID IN (${ids.join(',')})` : `SELECT * FROM songs`;
        (0, initDB_fn_1.getDb)().all(query, [], (err, songs) => {
            if (err) {
                return resolve(null);
            }
            resolve(songs);
        });
    });
}
exports.selectByIds = selectByIds;
function selectColumns(columns = []) {
    return new Promise(resolve => {
        let query = columns.length > 0 ? `SELECT ${columns.join(',')} FROM songs` : `SELECT * FROM songs`;
        (0, initDB_fn_1.getDb)().all(query, [], (err, songs) => {
            if (err) {
                return resolve(null);
            }
            resolve(songs);
        });
    });
}
exports.selectColumns = selectColumns;
