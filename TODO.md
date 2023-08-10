## TODO
* Reload album data & check album art.
* Remove album from library.
* Quick Play.

* Fix covers not working when song others than opus

* Playcount dynamic colors doesn't work in first launch

* Webp covers disappear the window not focused

* Disabling songs while playing are not updated. If song 1 is playing, then the next songs are loaded, if one of the loaded song is disabled, it is not reflected in the list.

* BUG Selected grouping save when clicking on another group but it shouldn't since no songs are clicked. It should only save when a new playback is set.

* Reset Playcount
* Colors error when switch from settings to library
* Clicking the album art in the status bar yields unexpected results
* For some reason when playing a song, no sound comes out.


on:click={() => rebuildArtCache()} on:keypress={() => rebuildArtCache()} tabindex="-1" role="button"


* Fix massive app freeze at app launch.