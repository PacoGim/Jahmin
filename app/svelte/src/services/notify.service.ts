import iziToast, { type IziToastSettings } from 'izitoast'

function success(message: string, customConfig: IziToastSettings = {}) {
	return iziToast.success({
		message,
		messageColor: '#fff',
		backgroundColor: 'var(--color-hl-blue)',
		icon: '',
		...customConfig
	})
}

function error(message: string, customConfig: IziToastSettings = {}) {
	return iziToast.error({
		message,
		messageColor: '#fff',
		backgroundColor: 'var(--color-hl-2)',
		icon: '',
		...customConfig
	})
}

export default {
	error,
	success
}
