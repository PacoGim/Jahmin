<script lang="ts">
	import type { SongType } from '../types/song.type'

	import { onMount } from 'svelte'

	import NextButton from '../components/NextButton.svelte'
	import PreviousButton from '../components/PreviousButton.svelte'
	import PlayButton from '../components/PlayButton.svelte'
	import PlayerProgress from '../components/PlayerProgress.svelte'
	import PlayerVolumeBar from '../components/PlayerVolumeBar.svelte'

	import { isPlaying, songPlayingIDStore } from '../store/final.store'

	import { nextSong } from '../functions/nextSong.fn'
	import { escapeString } from '../functions/escapeString.fn'
	import { albumPlayingIdStore, playbackCursor, playbackStore } from '../store/final.store'
	import { parseDuration } from '../functions/parseDuration.fn'

	let progress: number = 0

	let currentSong: SongType = undefined
	let nextSongPreloaded: { ID: number; BufferUrl: string } = undefined

	let player: HTMLAudioElement = undefined

	let playingInterval: NodeJS.Timeout = undefined

	let firstPlaybackCursorAssign = true

	let songTime = {
		currentTime: '00:00',
		duration: '00:00',
		timeLeft: '00:00'
	}

	$: {
		if (firstPlaybackCursorAssign === true) {
			firstPlaybackCursorAssign = false
		} else {
			// resetProgress()

			playSong($playbackCursor)
		}
	}

	let preLoadNextSongDebounce: NodeJS.Timeout = undefined

	async function playSong(playbackCursor: [number, boolean]) {
		let indexToPlay = playbackCursor[0]
		let doPlayNow = playbackCursor[1]
		let songs = $playbackStore
		let songToPlay = songs[indexToPlay]
		let url: string = undefined

		if (songToPlay?.ID === nextSongPreloaded?.ID) {
			url = nextSongPreloaded.BufferUrl
		} else if (songToPlay?.ID) {
			let songBuffer = await fetchSong(escapeString(songToPlay['SourceFile']))
			url = getUrlFromBuffer(songBuffer)
		} else {
			player.pause()
			player.src = ''
			$isPlaying = false
			return
		}

		player.src = url

		currentSong = songToPlay

		songTime = {
			currentTime: parseDuration(0),
			duration: parseDuration(songToPlay['Duration']),
			timeLeft: parseDuration(songToPlay['Duration'] - 0)
		}

		if (doPlayNow === true) {
			player
				.play()
				.then(() => {
					$songPlayingIDStore = songToPlay.ID

					localStorage.setItem('LastPlayedAlbumID', $albumPlayingIdStore)
					localStorage.setItem('LastPlayedSongID', String(songToPlay.ID))
					localStorage.setItem('LastPlayedSongIndex', String(indexToPlay))

					clearTimeout(preLoadNextSongDebounce)

					preLoadNextSongDebounce = setTimeout(() => {
						preLoadNextSong(playbackCursor)
					}, 500)
				})
				.catch((err) => {})
		} else {
			player.pause()
		}
	}

	function preLoadNextSong(playbackCursor: [number, boolean]) {
		let nextSong = playbackCursor[0] + 1
		let songs = $playbackStore
		let songToPlay = songs[nextSong]

		if (songToPlay) {
			fetchSong(escapeString(songToPlay['SourceFile'])).then((buffer) => {
				nextSongPreloaded = {
					ID: songToPlay.ID,
					BufferUrl: getUrlFromBuffer(buffer)
				}
			})
		}
	}

	function getUrlFromBuffer(targetBuffer) {
		return window.URL.createObjectURL(new Blob([targetBuffer]))
	}

	function resetProgress() {
		let playerForeground: HTMLElement = document.querySelector('player-progress progress-foreground')

		if (playerForeground) {
			playerForeground.classList.add('not-smooth')
			document.documentElement.style.setProperty('--song-time', `0%`)
			setTimeout(() => {
				playerForeground.classList.remove('not-smooth')
			}, 1000)
		}
	}

	onMount(() => {
		player = document.querySelector('audio')
	})

	function stopPlayer() {
		player.removeAttribute('src')
		player.pause()
		document.documentElement.style.setProperty('--song-time', `0%`)
		$isPlaying = false

		return
	}

	function fetchSong(songPath: string): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			fetch(songPath)
				.then((data) => data.arrayBuffer())
				.then((arrayBuffer) => {
					resolve(arrayBuffer)
				})
				.catch((err) => {
					//TODO Alert user that song is not found and offer a way to remove from DB.
					console.log('OOPS', err)
				})
		})
	}

	function startInterval() {
		$isPlaying = true

		clearInterval(playingInterval)

		playingInterval = setInterval(() => {
			// Rounds to 2 decimals.
			progress = Math.round(((100 / currentSong['Duration']) * player.currentTime + Number.EPSILON) * 100) / 100

			document.documentElement.style.setProperty('--song-time', `${progress}%`)

			songTime = {
				currentTime: parseDuration(player.currentTime),
				duration: parseDuration(currentSong['Duration']),
				timeLeft: parseDuration(currentSong['Duration'] - player.currentTime)
			}
		}, 100)
	}

	function stopInterval() {
		// console.log('Stop')
		$isPlaying = false
		clearInterval(playingInterval)
	}
</script>

<audio controls={true} on:play={() => startInterval()} on:pause={() => stopInterval()} on:ended={() => nextSong()}>
	<track kind="captions" />
</audio>

<player-svlt>
	<player-buttons>
		<PreviousButton {player} />
		<PlayButton {player} />
		<NextButton />
	</player-buttons>

	<PlayerVolumeBar {player} />

	<song-duration>
		{songTime.currentTime}/{songTime.duration}
	</song-duration>

	<PlayerProgress {player} song={currentSong} />

	<song-time-left>
		-{songTime.timeLeft}
	</song-time-left>
</player-svlt>

<style>
	player-svlt {
		z-index: 1;
		grid-area: player-svlt;
		display: flex;
		align-items: center;
		background-color: var(--high-color);
		color: var(--low-color);

		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	audio {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
	}

	player-buttons {
		height: var(--button-size);
		display: flex;
		flex-direction: row;
	}

	song-time-left {
		margin-right: 1rem;
	}

	:global(player-buttons > *) {
		cursor: pointer;
		margin: 0 0.75rem;
	}
</style>
