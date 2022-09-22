export type ColorType = {
	hue: number
	saturation: number
	lightnessBase: number
	lightnessLight: number
	lightnessDark: number
}



export function ColorTypeDefault(): ColorType {
	return {
		hue: 0,
		saturation: 0,
		lightnessBase: 0,
		lightnessLight: 0,
		lightnessDark: 0
	}
}
