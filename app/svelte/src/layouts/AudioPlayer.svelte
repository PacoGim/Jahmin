<script lang="ts">
	import { onMount } from 'svelte'

	/********************** Types **********************/
	import type { SongType } from '../../../types/song.type'

	/********************** Stores **********************/
	import {
		currentSongDurationStore,
		isAppIdle,
		playbackStore,
		playingSongStore,
		triggerScrollToSongEvent
	} from '../stores/main.store'
	import {
		altAudioPlayer,
		altAudioPlayerState,
		audioPlayerStates,
		currentAudioPlayer,
		currentAudioPlayerName,
		currentPlayerTime,
		isPlaying,
		mainAudioPlayer,
		mainAudioPlayerState,
		songToPlayUrlStore
	} from '../stores/player.store'

	/********************** Functions **********************/
	import doesFileExistFn from '../functions/doesFileExist.fn'
	import updateSongDataFn from '../functions/updateSongData.fn'
	import encodeURLFn from '../functions/encodeURL.fn'
	import { playbackRepeatCurrentConfig, playbackRepeatListConfig, playbackShuffleConfig } from '../stores/config.store'
	import findNextValidSongFn from '../functions/findNextValidSong.fn'
	import shuffleSongsFn from '../functions/shuffleSongs.fn'
	import nextSongFn from '../functions/nextSong.fn'
	import updatePlayCountFn from '../functions/updatePlayCount.fn'
	import fileNotFoundCheck from '../functions/songNotFound.fn'
	import songNotFoundFn from '../functions/songNotFound.fn'

	let isMounted = false

	let audioPlayerInterval: any = undefined

	let endOfPlayback = false

	// Time when the next song will start playing before the end of the playing song.
	// Makes songs audio overlap at the end to get a nice smooth transition between songs.
	// Default is 50ms -> (50ms / 1000ms = 0.25s).
	const smoothTimeSec = 50 / 1000

	$: startPlayingSong($songToPlayUrlStore[0] /* Song Url to Play */, $songToPlayUrlStore[1] /* Play now boolean */)

	$: if ($isPlaying === false && endOfPlayback === true) {
		afterPlaybackIsOver()
	}

	$: {
		$playbackShuffleConfig
		$playbackRepeatCurrentConfig
		$playbackStore
		listenPlaybackChangers()
	}

	isPlaying.subscribe(value => {
		if (value === true) {
			controlPlayerInterval('startInterval')
		} else {
			controlPlayerInterval('stopInterval')
		}
	})

	function listenPlaybackChangers() {
		if (isMounted === false) return

		const altName = $currentAudioPlayerName === 'main' ? 'alt' : 'main'

		const songId = Number($currentAudioPlayer?.dataset.songId)

		preLoadNextSong(
			altName,
			$playbackStore.findIndex(song => song.ID === songId),
			$playbackStore
		)
	}

	function afterPlaybackIsOver() {
		endOfPlayback = false

		if ($playbackRepeatListConfig === true) {
			if ($playbackShuffleConfig) {
				shuffleSongsFn().then(() => nextSongFn())
			} else {
				startPlayingSong($playbackStore[0].SourceFile, { playNow: true })
			}
		}
	}

	function startPlayingSong(songUrl: string | undefined, { playNow }: { playNow: boolean }) {
		if (isMounted === false) return
		if (songUrl === undefined) return

		// Gets the song data from the playback store (has all the songs data)
		let songData: SongType | undefined = $playbackStore.find(song => song.SourceFile === songUrl)

		// If the song data is undefined, then the song is not in the playback store
		if (songData === undefined) return

		$currentAudioPlayerName = 'main'

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

		$altAudioPlayer.pause()
		$altAudioPlayer.removeAttribute('src')
		$altAudioPlayer.setAttribute('data-song-id', '')

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

		doesFileExistFn(songUrl).then(result => {
			if (result === false) {
				console.log('Song does not exist: ', songUrl)
			} else {
				console.log(error)
			}
		})
	}

	function preLoadNextSong(audioPlayerName: string, songIndex: number, songList: SongType[]) {
		let nextSongToPlay: SongType | undefined = undefined

		if ($playbackRepeatCurrentConfig === true) {
			// If Song Repeat Enabled
			nextSongToPlay = songList[songIndex]
			/*	} else if ($playbackRepeatListConfig === true) {
			// If Playback Repeat Enabled

			// If there is no more songs in playback list, then the first song in the list is played.
			nextSongToPlay = findNextValidSongFn(songIndex, songList) || findNextValidSongFn(-1, songList)*/
		} else {
			// Song Repeat Disabled && If Playback Repeat Disabled
			nextSongToPlay = findNextValidSongFn(songIndex, songList)
		}

		if (nextSongToPlay !== undefined) {
			doesFileExistFn(nextSongToPlay.SourceFile).then(result => {
				if (result === true) {
					getAudioPlayer(audioPlayerName).setAttribute('src', encodeURLFn(nextSongToPlay!.SourceFile))
					getAudioPlayer(audioPlayerName).setAttribute('data-song-id', nextSongToPlay!.ID.toString())
				} else {
					// Song does not exist
					songNotFoundFn(nextSongToPlay!)
				}
			})
		} else {
			// No more songs in playback
			getAudioPlayer(audioPlayerName).removeAttribute('src')
			endOfPlayback = true
		}
	}

	function getAudioPlayer(audioplayerName: string): HTMLAudioElement {
		if (audioplayerName === 'alt') {
			return $altAudioPlayer
		}
		return $mainAudioPlayer
	}

	function getAudioPlayerInterval() {
		return setInterval(() => {
			const element = getAudioPlayer($currentAudioPlayerName)
			const name = element.id
			const altName = name === 'main' ? 'alt' : 'main'

			if (name !== $currentAudioPlayerName) {
				return
			}

			const currentTime = Number(element.currentTime.toFixed(2)) || 0
			const duration = Number(element.duration.toFixed(2)) || 0

			// No song is probably playing at this point but it might have started loading. We don't want to continue if the duration is 0
			if (duration === 0) return

			$currentSongDurationStore = duration
			$currentPlayerTime = currentTime

			////////// Audio Preloads Here \\\\\\\\\\
			if ($audioPlayerStates[altName].isPreloaded === false && $audioPlayerStates[altName].isPreloading === false) {
				$audioPlayerStates[altName].isPreloading = true

				let songId = Number(element.dataset.songId)

				let currentSongIndex = $playbackStore.findIndex(song => song.ID === songId)

				preLoadNextSong(altName, currentSongIndex, $playbackStore)
			}

			////////// Audio Pre Plays Here \\\\\\\\\\
			// If the current alt audio element is not yet playing and the current time is greater than the duration minus the smooth time, then the next song is played.

			let timeRemaining = Number((duration - currentTime).toFixed(2))

			if (timeRemaining <= 1 && $audioPlayerStates[altName].isPlaying === false) {
				$audioPlayerStates[altName].isPlaying = true

				const timeoutTime = (timeRemaining - smoothTimeSec) * 1000

				setTimeout(() => {
					let altPlayerSrc = getAudioPlayer(altName).getAttribute('src')

					if (altPlayerSrc === null || altPlayerSrc === undefined) {
						$audioPlayerStates[altName].isPlaying = false

						// console.log('Song missing?')

						// console.log('No more songs in playback')
						// fileNotFoundCheck(song)
					} else {
						getAudioPlayer(altName)
							.play()
							.then(() => {
								$currentAudioPlayerName = altName

								let songId = Number(getAudioPlayer(altName).dataset.songId)

								// Gets the song data from the playback store (has all the songs data)
								let songData: SongType | undefined = $playbackStore.find(song => song.ID === songId)

								if (songData === undefined) return

								updateSongDataFn(songData)

								if ($isAppIdle === true) triggerScrollToSongEvent.set(songId)
							})
							.catch(err => {
								/*
									// If next song gives and error, gets back the "previous" song being played.
					let previousPlayedSong = $playbackStore.find(
						song => song.ID === +audioElements[this.id].domElement.getAttribute('data-song-id')
					)

					// If the "previous" song is found, stop the previous audio player and set the previous as the playing one.
					// The objectif is to keep the overall app in a working state if an error was found.
					if (previousPlayedSong) {
						audioElements[this.id].isPlaying = false
						$songToPlayUrlStore = [previousPlayedSong.SourceFile, { playNow: false }]
					}
								*/
								songPlayingError(altPlayerSrc!, err)
							})
					}
				}, timeoutTime)
			}
		}, 250)
	}

	// Function to control the audio player interval
	function controlPlayerInterval(value: 'startInterval' | 'stopInterval') {
		if (value === 'startInterval') {
			audioPlayerInterval = getAudioPlayerInterval()
		} else if (value === 'stopInterval') {
			clearInterval(audioPlayerInterval)
		}
	}

	function hookEventListeners() {
		$mainAudioPlayer.addEventListener('playing', () => {
			$mainAudioPlayerState.isPlaying = true
		})

		$altAudioPlayer.addEventListener('playing', () => {
			$altAudioPlayerState.isPlaying = true
		})

		$mainAudioPlayer.addEventListener('pause', () => {
			$mainAudioPlayerState.isPlaying = false
		})

		$altAudioPlayer.addEventListener('pause', () => {
			$altAudioPlayerState.isPlaying = false
		})

		$mainAudioPlayer.addEventListener('ended', evt => {
			$mainAudioPlayerState.isPlaying = false
			let element = evt.target as HTMLAudioElement
			let songId = Number(element.dataset.songId)

			$mainAudioPlayerState = {
				isPlaying: false,
				isPreloaded: false,
				isPreloading: false
			}

			updatePlayCountFn(songId || 0, 'increment')
		})

		$altAudioPlayer.addEventListener('ended', evt => {
			$altAudioPlayerState.isPlaying = false
			let element = evt.target as HTMLAudioElement
			let songId = Number(element.dataset.songId)

			$altAudioPlayerState = {
				isPlaying: false,
				isPreloaded: false,
				isPreloading: false
			}

			updatePlayCountFn(songId || 0, 'increment')
		})

		$altAudioPlayer.addEventListener('canplaythrough', () => {
			$altAudioPlayerState.isPreloaded = true
			$altAudioPlayerState.isPreloading = false
		})

		$mainAudioPlayer.addEventListener('canplaythrough', () => {
			$mainAudioPlayerState.isPreloaded = true
			$mainAudioPlayerState.isPreloading = false
		})
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
