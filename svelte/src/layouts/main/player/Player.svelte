<script lang="ts">
	import { onMount } from 'svelte'

	import NextButton from './components/NextButton.svelte'
	import PreviousButton from './components/PreviousButton.svelte'
	import PlayButton from './components/PlayButton.svelte'
	import PlayerProgress from './components/PlayerProgress.svelte'
	import PlayerVolumeBar from './components/PlayerVolumeBar.svelte'
	import CoverArt from '../../../components/CoverArt.svelte'

	import type { SongType } from '../../../types/song.type'

	import { context, source } from '../../../store/equalizer.store'
	import {
		albumPlayingIdStore,
		isPlaying,
		playbackCursor,
		playbackStore,
		playerElement,
		playingSongStore,
		songPlayingIdStore,
		updateSongProgress
	} from '../../../store/final.store'

	import parseDuration from '../../../functions/parseDuration.fn'
	import { escapeString } from '../../../functions/escapeString.fn'
	import { nextSong } from '../../../functions/nextSong.fn'

	import { setWaveSource } from '../../../services/waveform.service'
	import { saveConfig } from '../../../services/ipc.service'
	import { groupByConfig, groupByValuesConfig } from '../../../store/config.store'

	let progress: number = 0

	let currentSong: SongType = undefined
	let nextSongPreloaded: { Id: number; BufferUrl: string } = undefined

	let rootDir = ''

	let player: HTMLAudioElement = undefined

	let songTime = {
		currentTime: '00:00',
		duration: '00:00',
		timeLeft: '00:00'
	}

	$: {
		if ($isPlaying) {
			navigator.mediaSession.playbackState = 'playing'
		} else {
			navigator.mediaSession.playbackState = 'paused'
		}
	}

	$: {
		if (player !== undefined && $context === undefined) {
			$context = new window.AudioContext()
			$source = $context.createMediaElementSource(player)
		}
	}

	$: {
		if (player !== undefined) {
			$playerElement = player
		}
	}

	$: playSong($playbackCursor)

	$: {
		// Updates the song time based of the user seeking in the player progress component.
		if ($updateSongProgress !== -1) {
			songTime = {
				currentTime: parseDuration($updateSongProgress),
				duration: parseDuration(currentSong['Duration']),
				timeLeft: parseDuration(currentSong['Duration'] - $updateSongProgress)
			}
		}
	}

	let preLoadNextSongDebounce: NodeJS.Timeout = undefined

	async function playSong(playbackCursor: [number, boolean]) {
		let indexToPlay = playbackCursor[0]
		let playNow = playbackCursor[1]
		let songs = $playbackStore
		let songToPlay = songs[indexToPlay]
		let url: string = undefined

		if (songToPlay === undefined) return

		rootDir = songToPlay.SourceFile.split('/').slice(0, -1).join('/')

		if (songToPlay?.ID === nextSongPreloaded?.Id) {
			url = nextSongPreloaded.BufferUrl
		} else if (songToPlay?.ID) {
			url = escapeString(songToPlay['SourceFile'])
		} else {
			player.pause()
			player.src = ''
			$isPlaying = false
			return
		}

		player.src = url

		currentSong = songToPlay
		$playingSongStore = currentSong

		songTime = {
			currentTime: parseDuration(0),
			duration: parseDuration(songToPlay['Duration']),
			timeLeft: parseDuration(songToPlay['Duration'] - 0)
		}

		navigator.mediaSession.metadata = new MediaMetadata({
			title: songToPlay.Title,
			artist: songToPlay.Album
		})

		setWaveSource(songToPlay.SourceFile, $albumPlayingIdStore, songToPlay.Duration)

		if (playNow === true) {
			player
				.play()
				.then(() => {
					$songPlayingIdStore = songToPlay.ID

					localStorage.setItem('LastPlayedAlbumId', $albumPlayingIdStore)
					localStorage.setItem('LastPlayedSongId', String(songToPlay.ID))
					localStorage.setItem('LastPlayedSongIndex', String(indexToPlay))

					clearTimeout(preLoadNextSongDebounce)

					preLoadNextSongDebounce = setTimeout(() => {
						preLoadNextSong(playbackCursor)
					}, 2000)


				})
				.catch(err => {
					nextSong()
				})
		} else {
			player.pause()
		}
	}

	function preLoadNextSong(playbackCursor: [number, boolean]) {
		let nextSong = playbackCursor[0] + 1
		let songs = $playbackStore
		let songToPlay = songs[nextSong]

		if (songToPlay) {
			fetchSong(escapeString(songToPlay['SourceFile'])).then(buffer => {
				nextSongPreloaded = {
					Id: songToPlay.ID,
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
				.then(data => data.arrayBuffer())
				.then(arrayBuffer => {
					resolve(arrayBuffer)
				})
				.catch(err => {
					//TODO Alert user that song is not found and offer a way to remove from DB.
				})
		})
	}

	function durationChanged(e) {
		// Rounds to 2 decimals.
		progress = Math.round(((100 / currentSong['Duration']) * player.currentTime + Number.EPSILON) * 100) / 100

		progress = progress >= 100 ? 100 : progress

		document.documentElement.style.setProperty('--song-time', `${progress}%`)

		songTime = {
			currentTime: parseDuration(player.currentTime),
			duration: parseDuration(currentSong['Duration']),
			timeLeft: parseDuration(currentSong['Duration'] - player.currentTime)
		}
	}
</script>

<audio
	controls={true}
	on:pause={() => ($isPlaying = false)}
	on:play={() => ($isPlaying = true)}
	on:timeupdate={e => durationChanged(e)}
	on:ended={() => nextSong()}
>
	<track kind="captions" />
</audio>

<player-svlt>
	<CoverArt klass="Player" {rootDir} style="height:64px;width:auto;cursor:pointer" type="forceLoad" />

	<player-buttons>
		<PreviousButton />
		<PlayButton />
		<NextButton />
	</player-buttons>

	<PlayerVolumeBar />

	<song-duration class="song-time">
		{songTime.currentTime}/{songTime.duration}
	</song-duration>

	<PlayerProgress song={currentSong} />

	<song-time-left class="song-time">
		-{songTime.timeLeft}
	</song-time-left>
</player-svlt>

<style>
	player-svlt {
		z-index: 3;
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

	.song-time {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}
	song-time-left {
		margin-right: 1rem;
	}

	:global(player-buttons > *) {
		cursor: pointer;
		margin: 0 0.75rem;
	}
</style>
