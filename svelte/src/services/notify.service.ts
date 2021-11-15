import iziToast from 'izitoast'

function success(message: string) {
	return iziToast.success({
		message,
    messageColor:'#fff',
    backgroundColor:'var(--color-hl-1)',
    icon:'',
	})
}

function error(message: string) {
	return iziToast.error({
		message,
    messageColor:'#fff',
    backgroundColor:'var(--color-hl-2)',
    icon:'',
	})
}

export default {
	error,
	success
}
