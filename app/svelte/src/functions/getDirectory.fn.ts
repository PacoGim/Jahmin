import { os } from '../stores/main.store'

export default function (inputString: string): string {
	let osLocal = undefined

	os.subscribe(value => (osLocal = value))

	if (osLocal === 'win32') {
		return inputString?.split('\\').slice(0, -1).join('\\') || ''
	} else {
		return inputString?.split('/').slice(0, -1).join('/') || ''
	}
}
