import iziToast, { type IziToastSettings } from 'izitoast'
import traduceFn from '../functions/traduce.fn'

let promiseResolve: (value?: unknown) => void

function success(message: string, customConfig: IziToastSettings = {}) {
	return iziToast.success({
		message,
		messageColor: '#fff',
		backgroundColor: 'var(--color-accent-1)',
		icon: '',
		...customConfig
	})
}

function error(message: string, customConfig: IziToastSettings = {}) {
	return iziToast.error({
		message,
		messageColor: '#fff',
		backgroundColor: 'var(--color-dangerRed)',
		icon: '',
		...customConfig
	})
}

function question(message:string) {
	return new Promise((resolve, reject) => {
		promiseResolve = resolve

		iziToast.question({
			messageColor: '#fff',
			backgroundColor: 'var(--color-accent-3)',
			timeout: 20000,
			close: false,
			overlay: false,
			displayMode: 0,
			icon: '',
			id: 'question',
			zindex: 999,
			message,
			position: 'topRight',
			buttons: [
				[
					`<button style="margin-right:.75rem;">${traduceFn('Yes')}</button>`,
					function (instance, toast) {
						instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
						return resolve(true)
					},
					true
				],
				[
					`<button>${traduceFn('No')}</button>`,
					function (instance, toast) {
						instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
						return resolve(false)
					},
					false
				]
			]
		})
	})
}

export default {
	error,
	success,
	question
}
