"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aac_format_1 = require("../formats/aac.format");
const flac_format_1 = require("../formats/flac.format");
const mp3_format_1 = require("../formats/mp3.format");
const opus_format_1 = require("../formats/opus.format");
const getFileExtension_fn_1 = __importDefault(require("./getFileExtension.fn"));
function default_1(songPath, newTags) {
    return new Promise((resolve, reject) => {
        let extension = (0, getFileExtension_fn_1.default)(songPath);
        if (extension === undefined) {
            return reject(new Error('Invalid file path'));
        }
        if (extension === 'opus') {
            (0, opus_format_1.writeOpusTags)(songPath, newTags)
                .then(response => {
                resolve(response);
            })
                .catch(err => reject(err));
        }
        else if (extension === 'mp3') {
            (0, mp3_format_1.writeMp3Tags)(songPath, newTags)
                .then(response => resolve(response))
                .catch(err => reject(err));
        }
        else if (extension === 'flac') {
            (0, flac_format_1.writeFlacTags)(songPath, newTags)
                .then(response => resolve(response))
                .catch(err => reject(err));
        }
        else if (extension === 'm4a') {
            (0, aac_format_1.writeAacTags)(songPath, newTags)
                .then(response => resolve(response))
                .catch(err => reject(err));
        }
        else {
            return reject(new Error('Invalid file path'));
        }
    });
}
exports.default = default_1;
