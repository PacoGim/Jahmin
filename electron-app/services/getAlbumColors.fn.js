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
exports.getAlbumColors = void 0;
const sharp_1 = __importDefault(require("sharp"));
const color_type_1 = require("../types/color.type");
//@ts-expect-error
const hex_to_hsl_1 = __importDefault(require("hex-to-hsl"));
const albumArt_service_1 = require("./albumArt.service");
const storage_service_1 = require("./storage.service");
let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
function getAlbumColors(imageId) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        let rootDir = (_a = (0, storage_service_1.getStorageMap)().get(imageId)) === null || _a === void 0 ? void 0 : _a.RootDir;
        if (!rootDir) {
            return resolve(undefined);
        }
        const image = yield (0, albumArt_service_1.getAlbumArt)(rootDir, true);
        if (image === undefined) {
            return resolve(undefined);
        }
        // let config = getConfig()
        // let imagePath = path.join(appDataPath(), '/art', String(config?.['art']?.['dimension']), `${imageId}.webp`)
        (0, sharp_1.default)(image.filePath)
            .resize(1, 1)
            .raw()
            .toBuffer((err, buffer) => {
            if (err) {
                return resolve({
                    hue: 0,
                    lightnessBase: 50,
                    lightnessHigh: 25,
                    lightnessLow: 75,
                    saturation: 0
                });
            }
            let hexColor = buffer.toString('hex').substring(0, 6);
            let hslColorObject = (0, color_type_1.ColorTypeShell)();
            const difference = 20;
            let hslColor = (0, hex_to_hsl_1.default)(hexColor);
            hslColorObject.hue = hslColor[0];
            hslColorObject.saturation = hslColor[1];
            hslColorObject.lightnessBase = hslColor[2];
            if (hslColorObject.lightnessBase + difference > 100) {
                // hslColorObject.lightnessHigh = hslColorObject.lightnessBase + difference - 100
                hslColorObject.lightnessHigh = 100 - difference * 3;
            }
            else {
                hslColorObject.lightnessHigh = hslColorObject.lightnessBase + difference;
            }
            if (hslColorObject.lightnessBase - difference < 0) {
                // hslColorObject.lightnessLow = 100 + hslColorObject.lightnessBase - difference
                hslColorObject.lightnessLow = 0 + difference * 3;
            }
            else {
                hslColorObject.lightnessLow = hslColorObject.lightnessBase - difference;
            }
            resolve(hslColorObject);
        });
    }));
}
exports.getAlbumColors = getAlbumColors;
