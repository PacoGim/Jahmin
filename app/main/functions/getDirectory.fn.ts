import getOsFn from '../../functions/getOs.fn'

export default function (inputString: string) {
	if (getOsFn() === 'win32') {
		return inputString?.split('\\').slice(0, -1).join('\\') || ''
	} else {
		return inputString?.split('/').slice(0, -1).join('/') || ''
	}
}
