import { get } from 'svelte/store'
import { configStore } from '../stores/config.store'
import { langFile } from '../stores/main.store'

import DOMPurify from 'dompurify'

export default function (stringToTraduce: string, values: object = undefined) {
	if (!stringToTraduce) return stringToTraduce

	let language = get(configStore)?.userOptions?.language
	let traduced = undefined

	if (language === 'english') {
		traduced = stringToTraduce
	} else {
		traduced = get(langFile)?.[stringToTraduce]
	}

	if (!traduced) {
		console.log(`Missing %c${stringToTraduce}%c traduction in ${language}`, 'font-weight: bold', '');
		traduced = stringToTraduce
	} else {
		if (values !== undefined) {
			for (let key in values) {
				traduced = traduced.replace(`\$\{${key}\}`, values[key])
			}
		}
	}

	return sanitizeHTML(traduced)
}

function sanitizeHTML(html) {
	const cleanHTML = DOMPurify.sanitize(html, {
		ALLOWED_TAGS: ['shift-button','bold']
	})
	return cleanHTML
}
