export type TagModMp3Type = {
	TIT2: string
	TRCK: number
	TALB: string
	TPE2: string
	TPE1: string
	comment: {
		language: string
		text: string
	}
	TCOM: string
	TDRC: string
	TPOS: number
	TCON: string
	popularimeter: {
		email: string
		rating: number
		counter: number
	}
}
