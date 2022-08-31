"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(bounds, area) {
    let newBoundaries = {
        x: 0,
        y: 0,
        height: 0,
        width: 0
    };
    if (bounds.x >= area.x &&
        bounds.y >= area.y &&
        bounds.x + bounds.width <= area.x + area.width &&
        bounds.y + bounds.height <= area.y + area.height) {
        newBoundaries.x = bounds.x;
        newBoundaries.y = bounds.y;
    }
    else {
        newBoundaries.x = area.x;
        newBoundaries.y = area.y;
    }
    if (bounds.width <= area.width && bounds.height <= area.height && bounds.height >= 500 && bounds.width >= 500) {
        newBoundaries.height = bounds.height;
        newBoundaries.width = bounds.width;
    }
    if (newBoundaries.height === 0 || newBoundaries.width === 0) {
        newBoundaries.height = area.height;
        newBoundaries.width = area.width;
    }
    return newBoundaries;
}
exports.default = default_1;
