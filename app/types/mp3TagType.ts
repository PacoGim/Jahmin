export type Mp3TagType = {
	TRCK: string
	track: string
	TPE2: string
	TALB: string
	TPE1: string
	'TXXX:comment': string
	TDRC: string
	'TXXX:rating': number
	TYER: string
	TPOS: string
	TCOM: string
	TIT2: string
	TCON: string
	COMM: { language: string; description: string; text: string }
	POPM: { email: string; rating: number; counter: number }
}
