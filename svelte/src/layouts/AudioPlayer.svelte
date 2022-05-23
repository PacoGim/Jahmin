<script lang="ts">
	import { onMount } from 'svelte'
	import { incrementPlayCount } from '../db/db'
	import findNextValidSongFn from '../functions/findNextValidSong.fn'
	import getDirectoryFn from '../functions/getDirectory.fn'
	import nextSongFn from '../functions/nextSong.fn'
	import previousSongFn from '../functions/previousSong.fn'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	import notifyService from '../services/notify.service'
	import { setWaveSource } from '../services/waveform.service'
	import { context, sourceAltAudio, sourceMainAudio } from '../store/equalizer.store'

	// Store
	import {
		currentAudioElement,
		albumPlayingIdStore,
		mainAudioElement,
		altAudioElement,
		playbackStore,
		playingSongStore,
		isPlaying,
		albumPlayingDirStore,
		isSongRepeatEnabledStore,
		isPlaybackRepeatEnabledStore,
		currentSongDurationStore,
		currentSongProgressStore
	} from '../store/final.store'
	import { currentPlayerTime, songToPlayUrlStore } from '../store/player.store'
	import type { SongType } from '../types/song.type'

	// Time when the next song will start playing before the end of the playing song.
	// Makes songs audio overlap at the end to get a nice smooth transition between songs.
	// Default is 250ms -> (250ms / 1000ms = 0.25s).
	const smoothTimeMs = 250 / 1000

	let audioElements = {
		main: {
			domElement: undefined,
			isPlaying: false,
			isPreloaded: false,
			isPreloading: false
		},
		alt: {
			domElement: undefined,
			isPlaying: false,
			isPreloaded: false,
			isPreloading: false
		}
	}

	$: {
		if ($mainAudioElement !== undefined && $context === undefined) {
			$context = new window.AudioContext()

			// Source for the main audio element.
			$sourceMainAudio = $context.createMediaElementSource($mainAudioElement)

			// Source for the alt audio element.
			$sourceAltAudio = $context.createMediaElementSource($altAudioElement)
		}
	}

	$: playSong($songToPlayUrlStore[0] /* Song Url to Play */, $songToPlayUrlStore[1] /* Play now boolean */)

	$: {
		if (audioElements) {
			checkIfIsPlaying()
		}
	}

	// Functions
	function checkIfIsPlaying() {
		if (audioElements.main.isPlaying === true || audioElements.alt.isPlaying === true) {
			$isPlaying = true
		} else {
			$isPlaying = false
		}
	}

	function playSong(songUrl: string | undefined, { playNow }) {
		if (songUrl) {
			$songToPlayUrlStore = undefined

			let song = $playbackStore.find(song => song.SourceFile === songUrl)

			if (song === undefined) {
				return
			}

			// If the song is disabled, finds the next enabled song to play.
			if (song.isEnabled === false) {
				// Gets the current song index in the playlist.
				let currentSongIndex = $playbackStore.findIndex(song => song.SourceFile === songUrl)

				let nextSong = findNextValidSongFn(currentSongIndex, $playbackStore)

				if (nextSong !== undefined) {
					// If an enabled song is found, play it.
					return playSong(nextSong.SourceFile, { playNow: true })
				} else {
					// If no enabled songs found, notify the user.
					return notifyService.error('No enabled songs found')
				}
			}

			updateCurrentSongData(song)

			setCurrentAudioElement($mainAudioElement)

			// Sets the new song to play.
			$mainAudioElement.src = songUrl

			// Stops the next audio element from playing.
			$altAudioElement.src = ''

			if (playNow) {
				// Starts playing the song.
				$mainAudioElement.play().catch(error => {})

				audioElements.main.isPlaying = true
				audioElements.main.isPreloaded = true
				audioElements.alt.isPlaying = false
				audioElements.alt.isPreloaded = false
			}
		}
	}

	function updateCurrentSongData(song: SongType) {
		$playingSongStore = song

		setWaveSource(song.SourceFile, $albumPlayingDirStore, song.Duration)

		localStorage.setItem('LastPlayedSongId', String(song.ID))
		localStorage.setItem('LastPlayedDir', String(getDirectoryFn(song.SourceFile)))
	}

	function setCurrentAudioElement(audioElement: HTMLAudioElement) {
		$currentAudioElement = audioElement
		$currentAudioElement.addEventListener('timeupdate', handleTimeUpdate)
	}

	function handleTimeUpdate() {
		// Alt audio name refers to the current alternative player.
		// If the main audio player is the current one then, the alt audio player is the next one.
		// If the alt audio player is the current one then, the main audio player is the next one.
		let altAudioName = this.id === 'main' ? 'alt' : 'main'

		const currentTime /* in seconds */ = this.currentTime
		const duration /* in seconds */ = this.duration

		$currentSongDurationStore = duration
		$currentSongProgressStore = currentTime

		// Update time only if the current audio element is playing.
		if (audioElements[this.id].isPlaying === true) {
			$currentPlayerTime = currentTime
		}

		////////// Audio Preloads Here \\\\\\\\\\
		// If the current time is greater than one second, then the next audio element is preloaded.
		if (audioElements[altAudioName].isPreloading === false && audioElements[altAudioName].isPreloaded === false) {
			audioElements[altAudioName].isPreloading = true

			let currentSongIndex = $playbackStore.findIndex(song => song.SourceFile === this.getAttribute('src'))

			preLoadNextSong(currentSongIndex, $playbackStore)

			// let nextValidSong = findNextValidSongFn(currentSongIndex, $playbackStore)

			// audioElements[altAudioName].domElement.src = nextValidSong.SourceFile
			/*


			// Gets the current song index.

			// audioElements[this.id].isPreloaded = false

			if (nextValidSong) {
			} else {
				if ($isPlaybackRepeatEnabledStore === true) {
					let firstValidSong = findNextValidSongFn(-1, $playbackStore)

					audioElements[altAudioName].domElement.src = firstValidSong.SourceFile
				} else {
					audioElements[altAudioName].domElement.src = ''
				}
			}

			*/
		}

		/* 		incrementPlayCount(
					$playbackStore.find(song => song.SourceFile === audioElements[this.id].domElement.getAttribute('src')).ID
				) */

		////////// Audio Pre Plays Here \\\\\\\\\\
		// If the current alt audio element is not yet playing and the current time is greater than the duration minus the smooth time, then the next song is played.
		if (audioElements[altAudioName].isPlaying === false && currentTime >= duration - smoothTimeMs) {
			audioElements[this.id].isPlaying = false

			audioElements[altAudioName].domElement
				.play()
				.then(() => {
					audioElements[altAudioName].isPlaying = true
					// audioElements[altAudioName].isPreloading = false
					// audioElements[altAudioName].isPreloaded = false
					$currentAudioElement = audioElements[altAudioName].domElement
				})
				.catch(() => {})
		}
	}
	/* 		let song = $playbackStore.find(song => song.SourceFile === audioElements[altAudioName].domElement.getAttribute('src'))

			if (song === undefined && $isPlaybackRepeatEnabledStore === true) {
				let rootDir = getDirectoryFn($playbackStore[0].SourceFile)

				setNewPlayback(rootDir, $playbackStore, undefined, { playNow: true })
			} else if (song !== undefined) {
				updateCurrentSongData(song)
				setCurrentAudioElement(audioElements[altAudioName].domElement)
			} else if (song === undefined) {
				// Resets the last played song, so the song gets back to progress 0 and can be played again just by pressing the play button.
				$songToPlayUrlStore = [$playingSongStore.SourceFile, { playNow: false }]
				$currentSongProgressStore = 0
				audioElements[altAudioName].isPlaying = false
			} */

	function preLoadNextSong(songIndex: number, songList: SongType[]) {
		let nextAudioElementId = $currentAudioElement.id === 'main' ? 'alt' : 'main'

		let nextSongToPlay = undefined

		if ($isSongRepeatEnabledStore === true) {
			// If Song Repeat Enabled
			nextSongToPlay = songList[songIndex]?.SourceFile
		} else if ($isPlaybackRepeatEnabledStore === true) {
			// If Playback Repeat Enabled

			// If there is no more songs in playback list, then the first song in the list is played.
			nextSongToPlay = findNextValidSongFn(songIndex, songList)?.SourceFile || findNextValidSongFn(-1, songList)?.SourceFile
		} else {
			// Song Repeat Disabled && If Playback Repeat Disabled
			nextSongToPlay = findNextValidSongFn(songIndex, songList)?.SourceFile
		}

		if (nextSongToPlay === undefined) nextSongToPlay = ''

		console.log(nextSongToPlay)

		audioElements[nextAudioElementId].domElement.src = nextSongToPlay
		audioElements[nextAudioElementId].isPreloading = false
	}

	function hookEventListeners() {
		$mainAudioElement.addEventListener('pause', () => {
			audioElements.main.isPlaying = false
		})

		$mainAudioElement.addEventListener('play', () => {
			audioElements.main.isPlaying = true
		})

		$altAudioElement.addEventListener('pause', () => {
			audioElements.alt.isPlaying = false
		})

		$altAudioElement.addEventListener('play', () => {
			audioElements.alt.isPlaying = true
		})

		$mainAudioElement.addEventListener('ended', () => {
			audioElements.main.isPlaying = false

			let currentIndex = $playbackStore.findIndex(song => song.SourceFile === audioElements.alt.domElement.getAttribute('src'))

			preLoadNextSong(currentIndex, $playbackStore)

			console.log('main ended')
		})

		$altAudioElement.addEventListener('ended', () => {
			audioElements.alt.isPlaying = false

			let currentIndex = $playbackStore.findIndex(song => song.SourceFile === audioElements.main.domElement.getAttribute('src'))

			preLoadNextSong(currentIndex, $playbackStore)

			console.log('alt ended')
		})

		$mainAudioElement.addEventListener('canplaythrough', e => {
			console.log('main canplaythrough')
			audioElements.main.isPreloaded = true
			audioElements.main.isPreloading = false
		})

		$altAudioElement.addEventListener('canplaythrough', e => {
			console.log('alt canplaythrough')
			audioElements.alt.isPreloaded = true
			audioElements.alt.isPreloading = false
		})
	}

	onMount(() => {
		$mainAudioElement = document.querySelector('audio#main')
		$altAudioElement = document.querySelector('audio#alt')

		audioElements.main.domElement = $mainAudioElement
		audioElements.alt.domElement = $altAudioElement

		$currentAudioElement = $mainAudioElement

		hookEventListeners()
	})
</script>

<audio id="main">
	<track kind="captions" />
</audio>

<audio id="alt">
	<track kind="captions" />
</audio>

<style>
	audio {
		display: none;
		position: fixed;
	}
</style>
