## TODO
### Important :
### When updating a song (like rating) the song can't play until the end flac, opus, aac

  #### How to replicate:

  - Start playing song
  - Update rating (easiest to update quickly)
  - At this point the song should be bugged (in the app, the actual song in the file system is fine)
  - If the song continues to play, it could: mute some part of the audio, return a wrong duration, stop playing (even triggers the "ended" event).

  #### Why is it happening?

  I think one of the reason is because when updating an opus, m4a or flac song (mp3 are safe), the methods I use updates the metadata of a song to a new file with a .temp. extension. Then, the original file gets deleted and the temp file takes it's place.

  While this makes sense to why it causes a streaming audio to fail after a while (since HTML streams audio automatically), it doesn't explain why the issue persists when double clicking a song again. It should pick up the new file created. Also, it doesn't explain why if a song not playing or not even preloaded gets modified, it bugs out the song.

  #### Possible fix:
  - If the problem is while the song is playing, we could simply **hold the update until the song is done playing**.
    - Issues with this approach: If the user closes the app while playing a song and after updating it and the app is closed, the song file will not be updated.
      - Fix: create a persistent queue?
---

### Others :
- Fix massive app freeze at app launch.

- Reload album data & check album art.

- Quick Play.

- Fix covers not working when song others than opus

- Webp covers disappear the window not focused

- Disabling songs while playing are not updated. If song 1 is playing, then the next songs are loaded, if one of the loaded song is disabled, it is not reflected in the list.

- If the playback has twice the same song in a row it will not play the next song

- (Not important) Wrong waveform color sometimes

- When playing a lot of super short audio, the player stops

- Run album check when the user switches album and doesn't switch again for x sec timer then ->
- Don't update song if the new tags are already in the song


- If:
  Play album
  Add album to playback
  Then randomize twice
  The added album is removed from playlist
