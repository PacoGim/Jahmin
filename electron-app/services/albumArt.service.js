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
exports.getAlbumCover = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
//@ts-ignore
const image_info_1 = __importDefault(require("image-info"));
const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
function getAlbumCover(rootDir) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let imageArray = [];
        try {
            fs_1.default.readdirSync(rootDir).forEach((file) => {
                const ext /*extension*/ = file.split('.').pop();
                if (ext === undefined)
                    return;
                if (validExtensions.includes(ext)) {
                    // return resolve(path.join(rootDir, file))
                    imageArray.push(path_1.default.join(rootDir, file));
                }
            });
        }
        catch (err) {
            return resolve(null);
        }
        // If no image were found.
        // return resolve(null)
        let bestImagePath = yield getBestImageFromArray(imageArray);
        console.log(bestImagePath);
        resolve(bestImagePath);
    }));
}
exports.getAlbumCover = getAlbumCover;
function getBestImageFromArray(imageArray) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let bestImage = { quality: 0, imagePath: '' };
        for (let [index, imagePath] of imageArray.entries()) {
            let quality = yield getQuality(imagePath);
            if (quality > bestImage['quality']) {
                // console.log('New Quality: ', quality, ' Old quality: ', bestImage['quality'])
                bestImage = {
                    quality,
                    imagePath
                };
            }
            //TODO Limit image names or ratio
            if (imageArray.length === index + 1) {
                resolve(bestImage['imagePath']);
            }
        }
    }));
}
function getQuality(imagePath) {
    return new Promise((resolve, reject) => {
        image_info_1.default(imagePath, (err, info) => {
            if (err) {
                return console.log(err);
            }
            else {
                let quality = info['width'] * info['height'] * info['bytes'];
                resolve(quality);
            }
        });
    });
}
