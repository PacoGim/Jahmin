export default function (hslString: string) {
	const [hue, saturation, lightness] = hslString.match(/\d+/g).map(Number)
	return {
		hue,
		saturation,
		lightness
	}
}
