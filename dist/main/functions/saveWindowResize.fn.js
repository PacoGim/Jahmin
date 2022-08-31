"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = require("../services/config.service");
function default_1(bounds) {
    (0, config_service_1.saveConfig)({
        bounds: {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        }
    });
}
exports.default = default_1;
