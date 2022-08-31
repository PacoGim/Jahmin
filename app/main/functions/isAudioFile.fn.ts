import allowedSongExtensionsVar from '../global/allowedSongExtensions.var'

export default function (path: string) {
	return allowedSongExtensionsVar.includes(path.split('.').pop() || '')
}
