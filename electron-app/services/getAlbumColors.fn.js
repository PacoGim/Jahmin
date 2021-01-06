"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumColors = void 0;
const sharp_1 = __importDefault(require("sharp"));
let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
function getAlbumColors(albumImagePath) {
    return new Promise((resolve, reject) => {
        console.log('Get Album Colors', albumImagePath);
        sharp_1.default(albumImagePath)
            .resize(1, 1)
            .raw()
            .toBuffer((err, buffer) => {
            if (err) {
                return;
            }
            let difference = 2;
            let midColor = buffer.toString('hex').substr(0, 6);
            let hiColor = '';
            let lowColor = '';
            for (let value of midColor) {
                let index = values.indexOf(value);
                if (index + difference >= values.length) {
                    hiColor += values[index + difference - values.length];
                }
                else {
                    hiColor += values[index + difference];
                }
            }
            for (let value of midColor) {
                let index = values.indexOf(value);
                if (index - difference < 0) {
                    lowColor += values[values.length - difference + index];
                }
                else {
                    lowColor += values[index - difference];
                }
            }
            resolve({ hiColor, midColor, lowColor });
        });
    });
}
exports.getAlbumColors = getAlbumColors;
