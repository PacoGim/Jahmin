import fs from 'fs'

export default function (imageLocation: string, elementId: string, height: number, width: number) {
	let isDirectory = fs.statSync(imageLocation).isDirectory()

	// console.log(imageLocation, elementId, height, width)
}
