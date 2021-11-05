import path from 'path'
import fs from 'fs'

import { appDataPath } from '..'
import EqualizerFile from './equalizerFile.service'
import { EqualizerFileObjectType } from '../types/equalizerFileObject.type'
import { ReturnMessageType } from '../types/returnMessage.type'
import fileExistsWithCaseSync from '../functions/fileExistsWithCaseSync.fn'

const eqFolderPath = path.join(appDataPath(), 'eq')

export function getEqFolderPath() {
	return eqFolderPath
}

export function getEqualizers() {
	let equalizerFilePaths = fs.readdirSync(eqFolderPath)
	let defaultEqualizerPath = path.join(eqFolderPath, 'Default.txt')
	let equalizers: any[] = []

	if (!fs.existsSync(eqFolderPath)) {
		fs.mkdirSync(eqFolderPath)
	}

	if (!fs.existsSync(defaultEqualizerPath)) {
		fs.writeFileSync(defaultEqualizerPath, EqualizerFile.stringify(defaultEqualizer))
		equalizers.push(defaultEqualizer)
	}

	equalizerFilePaths.forEach(filePath => {
		if (filePath !== '.DS_Store') {
			let equalizerObject = EqualizerFile.parse(fs.readFileSync(path.join(eqFolderPath, filePath), { encoding: 'utf8' }))

			equalizerObject.name = filePath.split('.')[0]

			equalizers.push(equalizerObject)
		}
	})

	return equalizers
}

export function renameEqualizer(eqId: string, newName: string): ReturnMessageType {
	let equalizers = getEqualizers()
	let foundEq = equalizers.find(x => x.id === eqId)

	if (foundEq) {
		let newNamePath = path.join(eqFolderPath, `${newName}.txt`)
		let oldNamePath = path.join(eqFolderPath, `${foundEq.name}.txt`)

		if (fileExistsWithCaseSync(newNamePath)) {
			return {
				code: 'EXISTS',
				message: 'Profile name already exists.'
			}
		}

		try {
			fs.renameSync(oldNamePath, newNamePath)

			return {
				code: 'OK'
			}
		} catch (error: any) {
			return {
				code: 'EX',
				message: error
			}
		}
	} else {
		return {
			code: 'NOT_FOUND',
			message: 'Equalizer not found.'
		}
	}
}

export function updateEqualizerValues(eqId: string, newValues: string) {
	let equalizers = getEqualizers()

	let foundEq = equalizers.find(x => x.id === eqId)

	if (foundEq) {
		foundEq.values = newValues

		try {
			fs.writeFileSync(path.join(eqFolderPath, `${foundEq.name}.txt`), EqualizerFile.stringify(foundEq))

			return true
		} catch (error) {
			return false
		}
	}
}

export function addEqualizer(newProfile: EqualizerFileObjectType): ReturnMessageType {
	if (newProfile.name === '') {
		newProfile.name = 'Noname'
	}

	if (!fs.existsSync(path.join(eqFolderPath, `${newProfile.name}.txt`))) {
		try {
			fs.writeFileSync(path.join(eqFolderPath, `${newProfile.name}.txt`), EqualizerFile.stringify(newProfile))

			return {
				code: 'OK'
			}
		} catch (error: any) {
			return {
				code: 'EX',
				message: error
			}
		}
	} else {
		return {
			code: 'EXISTS',
			message: 'Profile name already exists.'
		}
	}
}

export function deleteEqualizer(eqId: string): ReturnMessageType {
	let equalizers = getEqualizers()

	let foundEq = equalizers.find(x => x.id === eqId)

	if (foundEq) {
		let eqPath = path.join(eqFolderPath, `${foundEq.name}.txt`)

		if (fs.existsSync(eqPath)) {
			try {
				fs.unlinkSync(eqPath)

				return {
					code: 'OK'
				}
			} catch (error: any) {
				return {
					code: 'EX',
					message: error
				}
			}
		} else {
			return {
				code: 'NOT_FOUND',
				message: 'Equalizer not found.'
			}
		}
	} else {
		return {
			code: 'NOT_FOUND',
			message: 'Equalizer not found.'
		}
	}
}

let defaultEqualizer: EqualizerFileObjectType = {
	id: 'Default',
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
