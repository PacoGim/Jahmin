import { get } from 'svelte/store'
import { config } from '../stores/config.store'
import { langFile } from '../stores/main.store'

export default function (stringToTraduce: string, values: object = undefined) {
	if (!stringToTraduce) return stringToTraduce

	let language = get(config)?.userOptions?.language
	let traduced = undefined

	if (language === 'english') {
		traduced = stringToTraduce
	} else {
		traduced = get(langFile)?.[stringToTraduce]
	}

	if (!traduced) {
		console.log(`Missing "${stringToTraduce}" traduction in ${language}`)
	} else {
		if (values !== undefined) {
			for (let key in values) {
				traduced = traduced.replace(`\$\{${key}\}`, values[key])
			}
		}
	}

	return traduced || stringToTraduce
}
