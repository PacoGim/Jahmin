import { themeToEnable } from '../store/final.store'

export default function () {
	setSvelteStoreTheme(window.matchMedia('(prefers-color-scheme: light)').matches)

	window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (evt: MediaQueryListEvent) => {
		setSvelteStoreTheme(evt.matches)
	})
}

function setSvelteStoreTheme(isLightTheme: boolean) {
	if (isLightTheme) {
		themeToEnable.set('Light')
	} else {
		themeToEnable.set('Dark')
	}
}
