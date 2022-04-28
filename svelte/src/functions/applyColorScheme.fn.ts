export default function (color) {
	document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`)
	document.documentElement.style.setProperty('--base-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`)
	document.documentElement.style.setProperty('--high-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`)
}
