"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const getAlbumContextMenuTemplate_fn_1 = __importDefault(require("./getAlbumContextMenuTemplate.fn"));
const getGroupNameContextMenuTemplate_fn_1 = __importDefault(require("./getGroupNameContextMenuTemplate.fn"));
const getSongListContextMenuTemplate_fn_1 = __importDefault(require("./getSongListContextMenuTemplate.fn"));
function loadContextMenu(event, menuToOpen, data) {
    let template = [];
    if (menuToOpen === 'AlbumContextMenu') {
        template = (0, getAlbumContextMenuTemplate_fn_1.default)(data);
    }
    else if (menuToOpen === 'SongListContextMenu') {
        template = (0, getSongListContextMenuTemplate_fn_1.default)(data);
    }
    else if (menuToOpen === 'GroupNameContextMenu') {
        template = (0, getGroupNameContextMenuTemplate_fn_1.default)(data);
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    //@ts-expect-error
    menu.popup(electron_1.BrowserWindow.fromWebContents(event.sender));
}
exports.loadContextMenu = loadContextMenu;
