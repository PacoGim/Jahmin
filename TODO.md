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
* Add Play now in song list
* Add sorting when clicking on data header in song list
* If the playback has twice the same song in a row it will not play the next song


Add an auto 5 star if song reached end

on:click={() => rebuildArtCache()} on:keypress={() => rebuildArtCache()} tabindex="-1" role="button"

* Fix massive app freeze at app launch.

* App behaves unexpectedly on Mac when app "closed" and re opened.

* (Not important) Wrong waveform color sometimes

* (Too complicated to fix for now) The song progress doesn't update when app minimized

* (Not Important) When seeking in os widget, the change is not reflected in the song progress

* (Can't reproduce, needs more attention) Clicking on the album art on the status bar gives yields unexpected results (Blank song list?)

* Fix nasty timing bug

* Add reset playcount

* When playing a lot of super short audio, the player stops

* Try to figure why the cover don't load after the app is minimized for a long time

* (Can't reproduce) Previous keybind doesn't reset the song but goes to the previous song