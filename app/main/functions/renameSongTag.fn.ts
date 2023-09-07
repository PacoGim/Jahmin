export default function (tagName: string) {
	switch (tagName) {
		case 'SampleRate':
			return 'Sample Rate'
		case 'Sample Rate':
			return 'SampleRate'
		case 'PlayCount':
			return 'Play Count'
		case 'Play Count':
			return 'PlayCount'

		default:
			return tagName
	}
}
