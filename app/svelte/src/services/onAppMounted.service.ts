import iziToast from 'izitoast'
import { get } from 'svelte/store'
import applyColorSchemeFn from '../functions/applyColorScheme.fn'
import parseJsonFn from '../functions/parseJson.fn'
import {
	configOptionSelected,
	currentAudioElement,
	isAppIdle,
	isMouseDown,
	keyModifier,
	keyPressed,
	layoutToShow,
	mousePosition,
	playbackStore,
	selectedAlbumsDir,
	windowResize
} from '../stores/main.store'
import { handleContextMenuEvent } from './contextMenu/!contextMenu.service'
import cssVariablesService from './cssVariables.service'
import { runThemeHandler } from './themeHandler.service'
import setElementSizeToCssVariablesFn from '../functions/setElementSizeToCssVariables.fn'
import registerMediaKeysFn from '../functions/registerMediaKeys.fn'
import { pauseAnimatedArtWhenAppUnfocusedConfig } from '../stores/config.store'
import { setPlayerProgressFunction, stopPlayerProgressFunction } from '../stores/functions.store'
import { currentPlayerTime } from '../stores/player.store'

let appIdleDebounce = getAppIdleDebounce()

function flickTheme(flickToDay = true) {
	if (flickToDay === true) {
		document.querySelector('body').setAttribute('theme', 'Night')
	} else {
		document.querySelector('body').setAttribute('theme', 'Day')
	}

	setTimeout(() => {
		flickTheme(!flickToDay)
	}, 3000)
}

export default function () {
	setElementSizeToCssVariablesFn()

	afterLanguageChangeReload()

	iziToast.settings({ position: 'topRight' })

	runThemeHandler()

	window.ipc.sendAppReady()

	applyColorSchemeFn({
		hue: 0,
		lightnessBase: 30,
		lightnessLight: 45,
		lightnessDark: 15,
		saturation: 0
	})

	// To prevent slow transition of colors when app loads, the transition duration is set to 0ms by default then set to 500ms after 2000ms (Long after the app has finished loading).
	setTimeout(() => {
		cssVariablesService.set('theme-transition-duration', '1000ms')
		// flickTheme()
	}, 2000)

	window.addEventListener('resize', evt => {
		setElementSizeToCssVariablesFn()
		windowResize.set(new Date().getTime())
	})

	window.addEventListener('keydown', evt => {
		keyPressed.set(evt.key)

		if (evt.altKey) {
			keyModifier.set('altKey')
		} else if (evt.shiftKey) {
			keyModifier.set('shiftKey')
		} else if (evt.metaKey) {
			keyModifier.set('ctrlKey')
		} else if (evt.ctrlKey) {
			keyModifier.set('ctrlKey')
		}
	})

	window.addEventListener('keyup', () => {
		keyPressed.set(undefined)
		keyModifier.set(undefined)
	})

	window.addEventListener('mousemove', (evt: MouseEvent) => {
		mousePosition.set({ x: evt.pageX, y: evt.pageY })

		isAppIdle.set(false)

		clearTimeout(appIdleDebounce)

		appIdleDebounce = getAppIdleDebounce()
	})

	window.addEventListener('mouseup', (evt: MouseEvent) => {
		isMouseDown.set(false)
	})

	window.addEventListener('mousedown', (evt: MouseEvent) => {
		isMouseDown.set(true)
	})

	// Prevents scroll with spacebar.
	window.addEventListener('keydown', e => {
		return !(e.code === 'Space' && e.target === document.body)
	})

	window.addEventListener('contextmenu', (e: MouseEvent) => handleContextMenuEvent(e))

	window.addEventListener('blur', () => {
		if (get(pauseAnimatedArtWhenAppUnfocusedConfig) === true) {
			document.querySelectorAll('art-svlt video').forEach((videoElement: HTMLVideoElement) => {
				videoElement.pause()
			})

			document.querySelectorAll('art-svlt art-animation').forEach((artElement: HTMLElement) => {
				let art: HTMLElement = artElement.querySelector('.animated')
				let staticArt: HTMLElement = artElement.querySelector('.static')

				art.style.display = 'none'
				staticArt.style.display = 'block'
			})
		}
	})

	window.addEventListener('focus', () => {
		document.querySelectorAll('art-svlt video').forEach((videoElement: HTMLVideoElement) => {
			videoElement.play()
		})

		document.querySelectorAll('art-svlt art-animation').forEach((artElement: HTMLElement) => {
			let art: HTMLElement = artElement.querySelector('.animated')
			let staticArt: HTMLElement = artElement.querySelector('.static')

			art.style.display = 'block'
			staticArt.style.display = 'none'
		})
	})

	playbackStore.subscribe(value => {
		let selectedAlbumsDirLocal: string[] = undefined

		selectedAlbumsDir.subscribe(value => (selectedAlbumsDirLocal = value || []))()

		localStorage.setItem('SongList', JSON.stringify(value))

		/* 		value.forEach(song => {
			let songDirectory = getDirectoryFn(song.SourceFile)

			if (!selectedAlbumsDirLocal.includes(songDirectory)) {
				selectedAlbumsDirLocal.push(songDirectory)
				selectedAlbumsDir.set(selectedAlbumsDirLocal)
			}
		}) */
	})
}

function afterLanguageChangeReload() {
	let afterReload: any = parseJsonFn(localStorage.getItem('afterReload'))

	if (afterReload !== undefined && afterReload !== null) {
		configOptionSelected.set('Appearance')
		layoutToShow.set('Config')

		currentAudioElement.subscribe(audioPlayer => {
			const controller = new AbortController()
			const signal = controller.signal
			audioPlayer.addEventListener(
				'loadeddata',
				() => {
					if (afterReload.wasPlaying === true) {
						get(setPlayerProgressFunction)(afterReload.duration, { playNow: true })
					}

					localStorage.setItem('afterReload', undefined)
					controller.abort()
				},
				{ signal }
			)
		})()
	}
}

function getAppIdleDebounce() {
	return setTimeout(() => {
		isAppIdle.set(true)
	}, 30000)
}
