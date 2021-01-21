export function getRating(doc: any, extension: string) {
	try {
		if (extension === 'm4a') {
			let rating = doc['native']['iTunes'].find((i: any) => i['id'].toLowerCase() === 'rate')
			if (rating) return Number(rating['value'])
			else return ''
		} else if (extension === 'ogg' || extension === 'opus') {
			let rating = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'ratingpercent')

			if (rating) return Number(rating['value'])

			rating = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'rating')

			if (rating) return getStars(rating['value'], 100)
			else return ''
		} else if (extension === 'mp3') {
			let rating = doc['native']['ID3v2.4'].find((i: any) => i['id'].toLowerCase() === 'txxx:ratingpercent')
			if (rating) return Number(rating['value'])

			rating = doc['native']['ID3v2.4'].find((i: any) => i['id'].toLowerCase() === 'popm')
			if (rating) return getStars(rating['value']['rating'], 255)
		} else if (extension === 'flac') {
			let rating = doc['native']['vorbis'].find((i: any) => i['id'].toLowerCase() === 'rating')
			if (rating) return Number(rating['value'])
			else return ''
		} else {
			return 'Not Defined'
		}
	} catch (error) {
		console.log(doc)
		return ''
	}
}

function getStars(value: number, maxValue: number) {
	return Number((100 / maxValue) * value)
}
