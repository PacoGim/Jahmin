export type ColorType = {
	hue: number
	saturation: number
	lightnessBase: number
	lightnessHigh: number
	lightnessLow: number
}

export function ColorTypeShell(): ColorType {
	return {
		hue: 0,
		saturation: 0,
		lightnessBase: 0,
		lightnessHigh: 0,
		lightnessLow: 0
	}
}
