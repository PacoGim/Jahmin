"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComment = void 0;
function getComment(doc, extension) {
    try {
        if (['ogg', 'opus', 'flac'].includes(extension)) {
            let comment = doc['native']['vorbis'].find((i) => i['id'].toLowerCase() === 'description');
            if (comment)
                return comment['value'];
            comment = doc['native']['vorbis'].find((i) => i['id'].toLowerCase() === 'comment');
            if (comment)
                return comment['value'];
            else
                return '';
        }
        else if (extension === 'mp3') {
            let comment = doc['native']['ID3v2.4'].find((i) => i['id'].toLowerCase() === 'txxx:comment');
            if (comment)
                return comment['value'];
            comment = doc['common']['comment'];
            if (typeof comment === 'object')
                comment = comment[0];
            if (comment)
                return comment;
            else
                return '';
        }
        else {
            let comment = doc['common']['comment'];
            if (typeof comment === 'object')
                comment = comment[0];
            return comment;
        }
    }
    catch (error) {
        console.log(doc);
        return '';
    }
}
exports.getComment = getComment;
