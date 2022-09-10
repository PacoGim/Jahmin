import Freezeframe from 'freezeframe'
import iziToast from 'izitoast'
import { isAppIdle, keyPressed } from '../stores/main.store'
import { handleContextMenuEvent } from './contextMenu.service'
import { runThemeHandler } from './themeHandler.service'

let appIdleDebounce = getAppIdleDebounce()

export default function () {
	iziToast.settings({ position: 'topRight' })

	runThemeHandler()

	window.ipc.sendAppReady()

	// To prevent slow transition of colors when app loads, the transition duration is set to 0ms by default then set to 500ms after 2000ms (Long after the app has finished loading).
	setTimeout(() => {
		document.documentElement.style.setProperty('--theme-transition-duration', '500ms')
	}, 2000)

	window.addEventListener('keydown', evt => keyPressed.set(evt.key))

	window.addEventListener('keyup', () => keyPressed.set(undefined))

	window.addEventListener('mousemove', () => {
		isAppIdle.set(false)

		clearTimeout(appIdleDebounce)

		appIdleDebounce = getAppIdleDebounce()
	})

	// Prevents scroll with spacebar.
	window.addEventListener('keydown', e => {
		return !(e.code === 'Space' && e.target === document.body)
	})

	window.addEventListener('contextmenu', (e: MouseEvent) => handleContextMenuEvent(e))

	window.addEventListener('blur', () => {
		document.querySelectorAll('art-svlt video').forEach((videoElement: HTMLVideoElement) => {
			videoElement.pause()
		})

		document.querySelectorAll('art-svlt.animation').forEach((artElement: HTMLElement) => {
			let art: HTMLElement = artElement.querySelector(':not(.static)')
			let staticArt: HTMLElement = artElement.querySelector('.static')

			art.style.display = 'none'
			staticArt.style.display = 'block'
		})
	})

	window.addEventListener('focus', () => {
		document.querySelectorAll('art-svlt video').forEach((videoElement: HTMLVideoElement) => {
			videoElement.play()
		})

		document.querySelectorAll('art-svlt.animation').forEach((artElement: HTMLElement) => {
			let art: HTMLElement = artElement.querySelector(':not(.static)')
			let staticArt: HTMLElement = artElement.querySelector('.static')

			art.style.display = 'block'
			staticArt.style.display = 'none'
		})
	})
}

function getAppIdleDebounce() {
	return setTimeout(() => {
		isAppIdle.set(true)
	}, 60000)
}
