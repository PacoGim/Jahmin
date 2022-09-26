export default function (url: string | undefined) {
	if (url === undefined) return undefined

	url = encodeURI(url)
	url = url.replace('#', '%23')

	return url
}
