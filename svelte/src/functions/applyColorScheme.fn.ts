export default function (color) {
	document.documentElement.style.setProperty('--art-hue', color.hue)
	document.documentElement.style.setProperty('--art-saturation', color.saturation + '%')

	document.documentElement.style.setProperty('--art-lightness-dark', color.lightnessDark + '%')
	document.documentElement.style.setProperty('--art-lightness-base', color.lightnessBase + '%')
	document.documentElement.style.setProperty('--art-lightness-light', color.lightnessLight + '%')
}
