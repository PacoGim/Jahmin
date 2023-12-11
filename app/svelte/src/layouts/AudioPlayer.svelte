<script lang="ts">
	import { onMount } from 'svelte'

	/********************** Types **********************/
	import type { SongType } from '../../../types/song.type'

	/********************** Stores **********************/
	import { currentSongDurationStore, playbackStore } from '../stores/main.store'
	import {
		altAudioPlayer,
		altAudioPlayerState,
		audioPlayerStates,
		currentAudioPlayer,
		currentAudioPlayerName,
		currentPlayerTime,
		mainAudioPlayer,
		mainAudioPlayerState,
		songToPlayUrlStore
	} from '../stores/player.store'

	/********************** Functions **********************/
	import doFileExistsFn from '../functions/doFileExists.fn'
	import updateSongDataFn from '../functions/updateSongData.fn'
	import encodeURLFn from '../functions/encodeURL.fn'

	let isMounted = false

	// Time when the next song will start playing before the end of the playing song.
	// Makes songs audio overlap at the end to get a nice smooth transition between songs.
	// Default is 250ms -> (250ms / 1000ms = 0.25s).
	const smoothTimeSec = 250 / 1000

	$: startPlayingSong($songToPlayUrlStore[0] /* Song Url to Play */, $songToPlayUrlStore[1] /* Play now boolean */)

	function startPlayingSong(songUrl: string | undefined, { playNow }: { playNow: boolean }) {
		if (isMounted === false) return
		if (songUrl === undefined) return

		// Gets the song data from the playback store (has all the songs data)
		let songData: SongType | undefined = $playbackStore.find(song => song.SourceFile === songUrl)

		// If the song data is undefined, then the song is not in the playback store
		if (songData === undefined) return

		// Sets the source of the audio player to the song url
		$mainAudioPlayer.setAttribute('src', encodeURLFn(songData.SourceFile))
		$mainAudioPlayer.setAttribute('data-song-id', songData.ID.toString())

		// If playNow is set to true, then play the song
		if (playNow === true) {
			$mainAudioPlayer
				.play()
				.then(() => {
					afterSongPlays(songData!)
				})
				.catch(err => {
					songPlayingError(songUrl, err)
				})
				.finally(() => {
					$altAudioPlayer.pause()
				})
		} else {
			$mainAudioPlayerState.isPlaying = false
			$altAudioPlayerState.isPlaying = false
		}
	}

	function afterSongPlays(songData: SongType) {
		updateSongDataFn(songData)

		$mainAudioPlayerState = {
			isPlaying: true,
			isPreloaded: true,
			isPreloading: false
		}

		$altAudioPlayerState = {
			isPlaying: false,
			isPreloaded: false,
			isPreloading: false
		}
	}

	function songPlayingError(songUrl: string, error: any) {
		console.log('Song playing error: ', songUrl)

		doFileExistsFn(songUrl).then(result => {
			if (result === false) {
				console.log('Song does not exist: ', songUrl)
			} else {
				console.log(error)
			}
		})
	}

	function onAudioPlayerTimeUpdate(this: HTMLAudioElement, evt: Event) {
		const element = this as HTMLAudioElement
		const name = element.id
		const altName = name === 'main' ? 'alt' : 'main'

		if (name !== $currentAudioPlayerName) {
			return
		}

		const currentTime = Math.round(element.currentTime || 0)
		const duration = Math.round(element.duration || 0)

		$currentSongDurationStore = duration
		$currentPlayerTime = currentTime

		console.log(audioPlayerStates[altName])

		////////// Audio Preloads Here \\\\\\\\\\
		if (audioPlayerStates[altName].isPreloaded === false && audioPlayerStates[altName].isPreloading === false) {
			audioPlayerStates[altName].isPreloading = true

			let songId = Number(this.dataset.songId)

			let currentSongIndex = $playbackStore.findIndex(song => song.ID === songId)


		}
	}

	function hookEventListeners() {
		$mainAudioPlayer.addEventListener('playing', () => {
			$mainAudioPlayerState.isPlaying = true
		})

		$altAudioPlayer.addEventListener('playing', () => {
			$altAudioPlayerState.isPlaying = true
		})

		$mainAudioPlayer.addEventListener('timeupdate', onAudioPlayerTimeUpdate)
		$altAudioPlayer.addEventListener('timeupdate', onAudioPlayerTimeUpdate)
	}

	onMount(() => {
		isMounted = true

		hookEventListeners()
	})
</script>

<audio id="main" bind:this={$mainAudioPlayer}>
	<track kind="captions" />
</audio>

<audio id="alt" bind:this={$altAudioPlayer}>
	<track kind="captions" />
</audio>

<style>
</style>
