import path from 'path'
import fs from 'fs'

import { appDataPath } from '..'
import EqualizerFile from './equalizerFile.service'

const eqFolderPath = path.join(appDataPath(), 'eq')

export function getEqualizers() {
	let equalizerFilePaths = fs.readdirSync(eqFolderPath)
	let equalizers: any[] = []

	if (!fs.existsSync(eqFolderPath)) {
		fs.mkdirSync(eqFolderPath)
		fs.writeFileSync(path.join(eqFolderPath, 'default.txt'), EqualizerFile.stringify(defaultEqualizer))
	}

	equalizerFilePaths.forEach(filePath => {
		if (filePath !== '.DS_Store') {
			let equalizerObject = EqualizerFile.parse(fs.readFileSync(path.join(eqFolderPath, filePath), { encoding: 'utf8' }))
			equalizerObject.filePath = filePath
			equalizers.push(equalizerObject)
		}
	})

	if (equalizers.length === 0) {
		equalizers.push(defaultEqualizer)
	}

	return equalizers
}

export function renameEqualizer(eqId: string, newName: string) {
	let equalizers = getEqualizers()
	let foundEq = equalizers.find(x => x.id === eqId)

	if (foundEq) {
		foundEq.name = newName

		try {
			fs.writeFileSync(path.join(eqFolderPath, foundEq.filePath), EqualizerFile.stringify(foundEq))

			return true
		} catch (error) {
			return false
		}
	}
}

export function updateEqualizerValues(eqId: string, newValues: string) {
	let equalizers = getEqualizers()
	let foundEq = equalizers.find(x => x.id === eqId)

	if (foundEq) {
		foundEq.values = newValues

		try {
			fs.writeFileSync(path.join(eqFolderPath, foundEq.filePath), EqualizerFile.stringify(foundEq))

			return true
		} catch (error) {
			return false
		}
	}
}

let defaultEqualizer = {
	id: 'default',
	name: 'Default',
	values: [
		{ frequency: 32, gain: 0 },
		{ frequency: 64, gain: 0 },
		{ frequency: 128, gain: 0 },
		{ frequency: 256, gain: 0 },
		{ frequency: 512, gain: 0 },
		{ frequency: 1024, gain: 0 },
		{ frequency: 2048, gain: 0 },
		{ frequency: 4096, gain: 0 },
		{ frequency: 8192, gain: 0 },
		{ frequency: 16384, gain: 0 }
	]
}
