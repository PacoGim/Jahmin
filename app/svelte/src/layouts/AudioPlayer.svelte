<script lang="ts">
	import { onMount } from 'svelte'
	import type { SongType, PartialSongType } from '../../../types/song.type'
	import { playbackStore, playingSongStore } from '../stores/main.store'
	import { songToPlayUrlStore } from '../stores/player.store'
	import doFileExistsFn from '../functions/doFileExists.fn'

	let isMounted = false

	let mainAudioPlayer: HTMLAudioElement
	let altAudioPlayer: HTMLAudioElement

	$: startPlayingSong($songToPlayUrlStore[0] /* Song Url to Play */, $songToPlayUrlStore[1] /* Play now boolean */)

	function startPlayingSong(songUrl: string | undefined, { playNow }: { playNow: boolean }) {
		if (isMounted === false) return
		if (songUrl === undefined) return

		let songData: SongType | undefined = $playbackStore.find(song => song.SourceFile === songUrl)

		if (songData === undefined) return

		mainAudioPlayer.setAttribute('src', songData.SourceFile)

		if (playNow === true && songData.IsEnabled === 0) {
			mainAudioPlayer
				.play()
				.then(() => {
					afterSongPlays(songData!)
				})
				.catch(err => {
					songPlayingError(songUrl)
				})
			altAudioPlayer.pause()
		} else if (playNow === true && songData.IsEnabled === 1) {
			// Song is disabled, find next song and play it
		}
	}

	function afterSongPlays(songUrl: SongType) {
		console.log(songUrl)
	}

	function songPlayingError(songUrl: string) {
		doFileExistsFn(songUrl).then(result => {
			if (result === false) {
				// Do something?
			}
		})
	}

	onMount(() => {
		isMounted = true

		mainAudioPlayer.volume = 0.05
	})
</script>

<audio id="main" bind:this={mainAudioPlayer}>
	<track kind="captions" />
</audio>

<audio id="alt" bind:this={altAudioPlayer}>
	<track kind="captions" />
</audio>

<style>
</style>
