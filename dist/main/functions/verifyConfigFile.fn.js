"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(configFile, defaultConfigFile) {
    if (configFile?.userOptions === undefined) {
        configFile.userOptions = defaultConfigFile.userOptions;
    }
    configFile.userOptions = definedDefaults(configFile.userOptions, defaultConfigFile.userOptions);
    if (configFile?.group?.groupBy === undefined || configFile?.group?.groupBy?.length === 0) {
        configFile.group = defaultConfigFile.group;
    }
    if (configFile?.songListTags === undefined || configFile?.songListTags?.length === 0) {
        configFile.songListTags = defaultConfigFile.songListTags;
    }
    return configFile;
}
exports.default = default_1;
function definedDefaults(o, defaults) {
    let objectCopy = { ...o };
    Object.entries(defaults).forEach((entry) => {
        if (objectCopy?.[entry[0]] === undefined) {
            objectCopy[entry[0]] = entry[1];
        }
    });
    return objectCopy;
}
