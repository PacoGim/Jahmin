## TODO
* Reload album data & check album art.
* Remove album from library.
* Quick Play.

* Fix covers not working when song others than opus

* Playcount dynamic colors doesn't work in first launch

* Webp covers disappear the window not focused

* Disabling songs while playing are not updated. If song 1 is playing, then the next songs are loaded, if one of the loaded song is disabled, it is not reflected in the list.

* Colors error when switch from settings to library
* For some reason when playing a song, no sound comes out.
* If the playback has twice the same song in a row it will not play the next song

Add an auto 5 star if song reached end

on:click={() => rebuildArtCache()} on:keypress={() => rebuildArtCache()} tabindex="-1" role="button"

* Fix massive app freeze at app launch.

* App behaves unexpectedly on Mac when app "closed" and re opened.

* (Not important) Wrong waveform color sometimes

* (Can't reproduce, needs more attention) Clicking on the album art on the status bar gives yields unexpected results (Blank song list?)

* Fix nasty timing bug

* When playing a lot of super short audio, the player stops

* Try to figure why the cover don't load after the app is minimized for a long time

* Previous keybind (on keyboard) doesn't reset the song but goes to the previous song
* Using Previous/Next on keyboard multimedia keys doesn't update the progress properly

* Improve progress bar when clicking playing new song

