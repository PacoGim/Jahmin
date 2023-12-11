export default function (url: string) {
	url = encodeURI(url)
	url = url.replace('#', '%23')

	return url
}
