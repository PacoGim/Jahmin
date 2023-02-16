import cssVariablesService from '../services/cssVariables.service'

export default function (color: {
	hue: number
	lightnessBase: number
	lightnessLight: number
	lightnessDark: number
	saturation: number
}) {
	cssVariablesService.set('art-hue', color.hue)
	cssVariablesService.set('art-saturation', color.saturation + '%')

	cssVariablesService.set('art-lightness-dark', color.lightnessDark + '%')
	cssVariablesService.set('art-lightness-base', color.lightnessBase + '%')
	cssVariablesService.set('art-lightness-light', color.lightnessLight + '%')
}
