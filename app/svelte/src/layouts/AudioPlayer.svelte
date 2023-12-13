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
		isPlaying,
		mainAudioPlayer,
		mainAudioPlayerState,
		songToPlayUrlStore
	} from '../stores/player.store'

	/********************** Functions **********************/
	import doFileExistsFn from '../functions/doFileExists.fn'
	import updateSongDataFn from '../functions/updateSongData.fn'
	import encodeURLFn from '../functions/encodeURL.fn'
	import { playbackRepeatCurrentConfig, playbackRepeatListConfig } from '../stores/config.store'
	import findNextValidSongFn from '../functions/findNextValidSong.fn'

	let isMounted = false

	let audioPlayerInterval: any = undefined

	// Time when the next song will start playing before the end of the playing song.
	// Makes songs audio overlap at the end to get a nice smooth transition between songs.
	// Default is 250ms -> (250ms / 1000ms = 0.25s).
	const smoothTimeSec = 250 / 1000

	$: startPlayingSong($songToPlayUrlStore[0] /* Song Url to Play */, $songToPlayUrlStore[1] /* Play now boolean */)

	$: console.log($isPlaying)

	isPlaying.subscribe(value => {
		if (value === true) {
			controlPlayerInterval('startInterval')
		} else {
			controlPlayerInterval('stopInterval')
		}
	})

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

	function preLoadNextSong(audioPlayerName: string, songIndex: number, songList: SongType[]) {
		let nextSongToPlay = undefined

		if ($playbackRepeatCurrentConfig === true) {
			// If Song Repeat Enabled
			nextSongToPlay = songList[songIndex]
		} else if ($playbackRepeatListConfig === true) {
			// If Playback Repeat Enabled

			// If there is no more songs in playback list, then the first song in the list is played.
			nextSongToPlay = findNextValidSongFn(songIndex, songList) || findNextValidSongFn(-1, songList)
		} else {
			// Song Repeat Disabled && If Playback Repeat Disabled
			nextSongToPlay = findNextValidSongFn(songIndex, songList)
		}

		if (nextSongToPlay !== undefined) {
			getAudioPlayer(audioPlayerName).setAttribute('src', encodeURLFn(nextSongToPlay.SourceFile))
			getAudioPlayer(audioPlayerName).setAttribute('data-song-id', nextSongToPlay.ID.toString())
		} else {
			// Playback is done
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

			console.count('Interval')

			if (name !== $currentAudioPlayerName) {
				return
			}

			const currentTime = Number(element.currentTime.toFixed(2)) || 0
			const duration = Number(element.duration.toFixed(2)) || 0

			// No song is probably playing at this point but it might have started loading. We don't want to continue if the duration is 0
			if (duration === 0) return

			$currentSongDurationStore = duration
			$currentPlayerTime = currentTime

			// console.log(audioPlayerStates[altName])

			////////// Audio Preloads Here \\\\\\\\\\
			if (audioPlayerStates[altName].isPreloaded === false && audioPlayerStates[altName].isPreloading === false) {
				audioPlayerStates[altName].isPreloading = true

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
					console.log('!!!!!!', Number(element.duration.toFixed(2)) - Number(element.currentTime.toFixed(2)))

					let altPlayerSrc = getAudioPlayer(altName).getAttribute('src')

					if (altPlayerSrc === null || altPlayerSrc === undefined) {
					} else {
						getAudioPlayer(altName)
							.play()
							.then(() => {
								console.log('Alt player playing')

								$currentAudioPlayerName = altName
								$audioPlayerStates[altName].isPlaying = true
							})
							.catch(err => {
								songPlayingError(altPlayerSrc!, err)
							})
					}
				}, timeoutTime)
			}
		}, 250)
	}

	// TODO Move the preload to a different function

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

		$mainAudioPlayer.addEventListener('ended', () => {
			// Remove custom timer
		})

		$altAudioPlayer.addEventListener('playing', () => {
			$altAudioPlayerState.isPlaying = true
		})

		// $mainAudioPlayer.addEventListener('timeupdate', onAudioPlayerTimeUpdate)
		// $altAudioPlayer.addEventListener('timeupdate', onAudioPlayerTimeUpdate)

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
