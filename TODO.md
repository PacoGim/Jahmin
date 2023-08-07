## TODO
* Add Song/Album to playback, adds Songs at the end of a playback.
* Play next on right click Song/Album, adds the right clicked song and the songs that follows right after the current playing song.
* Reload album data & check album art.
* Remove album from library.
* Quick Play.
* Select multiple albums.

* Disable Autochoose songs when clicking on lyrics.
* Add autoswitch functionality.
* When clicking on editing lyrics, auto select it.
* Add Auto Switch Song configuration.
* Add a playing symbol next to the playing song in lyrics list.

* Remember playback list

* Add multiple album selection

* Fix covers not working when song others than opus

* Verifiy matching eq hash before saving
* Playcount dynamic colors doesn't work in first launch

* Webp covers disappear the window not focused

* Disabling songs while playing are not updated. If song 1 is playing, then the next songs are loaded, if one of the loaded song is disabled, it is not reflected in the list.

* BUG Selected grouping save when clicking on another group but it shouldn't since no songs are clicked. It should only save when a new playback is set.

Reset Playcount


on:click={() => rebuildArtCache()} on:keypress={() => rebuildArtCache()} tabindex="-1" role="button"


