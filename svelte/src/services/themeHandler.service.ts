import { themeConfig } from '../store/config.store'

export function runThemeHandler() {
	// Enables Auto theme when the app first runs.
	enableAutoTheme(window.matchMedia('(prefers-color-scheme: light)').matches)

	// Listens to system theme change and applies proper theme.
	window
		.matchMedia('(prefers-color-scheme: light)')
		.addEventListener('change', (evt: MediaQueryListEvent) => enableAutoTheme(evt.matches))

	// Listens to changes in theme from AppearanceOption.
	themeConfig.subscribe(themeOption => {
		if (themeOption === 'Light') {
			// Sets theme to light
			setHTMLThemeAtb(true)
		} else if (themeOption === 'Auto') {
			// Sets theme to system default
			setHTMLThemeAtb(window.matchMedia('(prefers-color-scheme: light)').matches)
		} else {
			// Sets theme to dark
			setHTMLThemeAtb(false)
		}
	})
}

// Sets Auto theme ONLY if enabled in the config file or selected as Option.
function enableAutoTheme(isLightTheme: boolean) {
	themeConfig.subscribe(themeOption => {
		if (themeOption === 'Auto') {
			setHTMLThemeAtb(isLightTheme)
		}
	})()
}

// Sets the
function setHTMLThemeAtb(isLightTheme: boolean) {
	document.body.setAttribute('theme', isLightTheme ? 'Light' : 'Dark')
}
