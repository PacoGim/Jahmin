import sharp from 'sharp'

let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function getAlbumColors(albumImagePath: string) {
	return new Promise((resolve, reject) => {
		sharp(albumImagePath)
			.resize(1, 1)
			.raw()
			.toBuffer((err, buffer) => {
				if (err) {
					return
				}

				let difference = 2
				let midColor = buffer.toString('hex').substr(0, 6)

				let hiColor = ''
				let lowColor = ''

				for (let value of midColor) {
					let index = values.indexOf(value)

					if (index + difference >= values.length) {
						hiColor += values[index + difference - values.length]
					} else {
						hiColor += values[index + difference]
					}
				}

				for (let value of midColor) {
					let index = values.indexOf(value)

					if (index - difference < 0) {
						lowColor += values[values.length - difference + index]
					} else {
						lowColor += values[index - difference]
					}
				}

				resolve({ hiColor, midColor, lowColor })
			})
	})
}
