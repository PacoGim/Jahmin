"use strict";
// ©nam
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitle = void 0;
function getTitle(doc, extension) {
    let title = undefined;
    if (extension === 'm4a') {
        title = doc['native']['iTunes'].find((i) => i['id'] === '©nam');
        if (title)
            return title['value'];
    }
    return doc['common']['title'] || undefined;
}
exports.getTitle = getTitle;
