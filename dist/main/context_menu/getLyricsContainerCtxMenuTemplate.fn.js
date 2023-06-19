"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
function default_1(data) {
    let template = [];
    template.push({
        label: `Delete Lyrics`,
        click: () => {
            (0, sendWebContents_fn_1.default)('confirm-lyrics-deletion', {
                lyricsTitle: data.lyricsTitle,
                lyricsArtist: data.lyricsArtist
            });
            // deleteLyrics(data.lyricsTitle, data.lyricsArtist).then(response => {
            // sendWebContentsFn('lyrics-deleted', response)
            // })
        }
    });
    return template;
}
exports.default = default_1;
