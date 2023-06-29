"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _dbObject_1 = require("./!dbObject");
function default_1(songs) {
    return new Promise((resolve, reject) => {
        // Will contain songs grouped by the same new tags to update.
        let updateGroups = [];
        // Iterates through each song gets the id and new tags to update.
        songs.forEach(({ id, newTags }) => {
            // Stringyfies the new tags to use as key for the updateGroups object array.
            let objectKey = JSON.stringify(newTags);
            // Checks if the updateGroups already contains the object key a.k.a. the stringyfied new tags object.
            let findGroup = updateGroups.find(group => group.id === objectKey);
            // If the group already exists, add the song id to the array of songs id.
            if (findGroup) {
                findGroup.songsId.push(id);
            }
            else {
                // If the group doesn't exist, create it.
                updateGroups.push({
                    id: objectKey,
                    newTags,
                    songsId: [id] // The array of songs id to update.
                });
            }
        });
        // Since multiple bulk update will run, it needs to wait for all the updates to finish before resolving.
        let bulkUpdatePromises = [];
        // Iterates through each group of songs to update and add the promises to the bulk update promises array.
        updateGroups.forEach(group => {
            bulkUpdatePromises.push((0, _dbObject_1.getDB)().songs.where('ID').anyOf(group.songsId).modify(group.newTags));
        });
        // When all promises are done, then update version, catch errors and finally resolve.
        Promise.all(bulkUpdatePromises)
            .then(x => {
            // updateVersionFn()
        })
            .catch(err => {
            console.log(err);
        })
            .finally(() => {
            resolve(undefined);
        });
    });
}
exports.default = default_1;
