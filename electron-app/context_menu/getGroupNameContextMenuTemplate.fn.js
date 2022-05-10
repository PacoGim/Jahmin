"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendWebContents_service_1 = require("../services/sendWebContents.service");
function default_1(data) {
    let groupName = data.groupName;
    let index = data.index;
    let template = [];
    let tags = ['Album', 'Artist', 'Track', 'Title', 'Genre', 'Composer', 'Year', 'Disc #', 'Extension'];
    // Removes the current tag from the list.
    tags.splice(tags.indexOf(groupName), 1);
    // Then adds the current tag to the begining of  the list.
    tags.unshift(groupName);
    tags.forEach(tag => {
        template.push({
            label: `${groupName === tag ? '•' : ''} ${tag}`,
            click: () => {
                (0, sendWebContents_service_1.sendWebContents)('new-group', {
                    index,
                    groupName: tag
                });
            }
        });
    });
    return template;
}
exports.default = default_1;
