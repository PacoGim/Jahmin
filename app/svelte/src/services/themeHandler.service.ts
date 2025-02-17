import { themeConfig } from '../stores/config.store'

export function runThemeHandler() {
	// Enables SystemBased theme when the app first runs.
	enableSystemBasedTheme(window.matchMedia('(prefers-color-scheme: light)').matches)

	// Listens to system theme change and applies proper theme.
	window
		.matchMedia('(prefers-color-scheme: light)')
		.addEventListener('change', (evt: MediaQueryListEvent) => enableSystemBasedTheme(evt.matches))

	// Listens to changes in theme from AppearanceOption.
	themeConfig.subscribe(newTheme => {
		if (newTheme === 'Day') {
			// Sets theme to day
			setHTMLThemeAtb(true)
		} else if (newTheme === 'SystemBased') {
			// Sets theme to system default
			setHTMLThemeAtb(window.matchMedia('(prefers-color-scheme: light)').matches)
		} else {
			// Sets theme to night
			setHTMLThemeAtb(false)
		}
	})
}

// Sets SystemBased theme ONLY if enabled in the config file or selected as Option.
function enableSystemBasedTheme(isDayTheme: boolean) {
	themeConfig.subscribe(newTheme => {
		if (newTheme === 'SystemBased') {
			setHTMLThemeAtb(isDayTheme)
		}
	})()
}

// Sets the
function setHTMLThemeAtb(isDayTheme: boolean) {
	document.body.setAttribute('theme', isDayTheme ? 'Day' : 'Night')
}
