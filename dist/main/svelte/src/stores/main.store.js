"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songListTagsValuesStore = exports.songListItemElement = exports.songSyncQueueProgress = exports.artCompressQueueProgress = exports.albumArtMapStore = exports.isPlaying = exports.selectedGroups = exports.currentAudioElement = exports.altAudioElement = exports.mainAudioElement = exports.layoutToShow = exports.elementMap = exports.appTitle = exports.keyPressed = exports.dbVersionStore = exports.dbSongsStore = exports.config = exports.selectedSongsStore = exports.activeSongStore = exports.playbackStore = exports.isPlaybackRepeatEnabledStore = exports.isSongRepeatEnabledStore = exports.isSongShuffleEnabledStore = exports.triggerGroupingChangeEvent = exports.triggerScrollToSongEvent = exports.playbackCursor = exports.playingSongStore = exports.currentSongProgressStore = exports.currentSongDurationStore = exports.albumPlayingDirStore = exports.selectedAlbumDir = exports.songListStore = exports.isAppIdle = void 0;
const store_1 = require("svelte/store");
exports.isAppIdle = (0, store_1.writable)(false);
// List to show within Song List component.
exports.songListStore = (0, store_1.writable)([]);
exports.selectedAlbumDir = (0, store_1.writable)(undefined);
exports.albumPlayingDirStore = (0, store_1.writable)(undefined);
exports.currentSongDurationStore = (0, store_1.writable)(0);
exports.currentSongProgressStore = (0, store_1.writable)(0);
exports.playingSongStore = (0, store_1.writable)(undefined);
// Number = index of the playbackStore to play
// Boolean = Start playing right away or not.
exports.playbackCursor = (0, store_1.writable)([0, false]);
exports.triggerScrollToSongEvent = (0, store_1.writable)(0);
exports.triggerGroupingChangeEvent = (0, store_1.writable)([]);
exports.isSongShuffleEnabledStore = (0, store_1.writable)(false);
exports.isSongRepeatEnabledStore = (0, store_1.writable)(false);
exports.isPlaybackRepeatEnabledStore = (0, store_1.writable)(false);
// List to keep track of songs to play.
exports.playbackStore = (0, store_1.writable)([]);
exports.activeSongStore = (0, store_1.writable)(undefined);
exports.selectedSongsStore = (0, store_1.writable)([]);
/********************** Config **********************/
exports.config = (0, store_1.writable)(undefined);
/********************** Database **********************/
exports.dbSongsStore = (0, store_1.writable)([]);
exports.dbVersionStore = (0, store_1.writable)(undefined);
/********************** Keyboard Events **********************/
exports.keyPressed = (0, store_1.writable)(undefined);
exports.appTitle = (0, store_1.writable)('Jahmin');
exports.elementMap = (0, store_1.writable)(undefined);
/********************** ConfigLayout **********************/
exports.layoutToShow = (0, store_1.writable)('Library');
exports.mainAudioElement = (0, store_1.writable)(undefined);
exports.altAudioElement = (0, store_1.writable)(undefined);
exports.currentAudioElement = (0, store_1.writable)(undefined);
/********************** Song Group **********************/
exports.selectedGroups = (0, store_1.writable)([]);
// Allows to share with the rest of the app whether the player is playing or not.
exports.isPlaying = (0, store_1.writable)(false);
exports.albumArtMapStore = (0, store_1.writable)(new Map());
/********************** Queue Progress **********************/
exports.artCompressQueueProgress = (0, store_1.writable)({
    maxLength: 0,
    currentLength: 0
});
exports.songSyncQueueProgress = (0, store_1.writable)({
    isSongUpdating: false,
    maxLength: 0,
    currentLength: 0
});
exports.songListItemElement = (0, store_1.writable)(undefined);
exports.songListTagsValuesStore = (0, store_1.writable)([]);
