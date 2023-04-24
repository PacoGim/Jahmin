import path from 'path'
import fs from 'fs'

import EqualizerFile from './equalizerFile.service'
import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'
import { ReturnMessageType } from '../../types/returnMessage.type'
import fileExistsWithCaseSyncFn from '../functions/fileExistsWithCaseSync.fn'
import getStringHashFn from '../functions/getStringHash.fn'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

const eqFolderPath = path.join(getAppDataPathFn(), 'eq')

export function getEqFolderPath() {
	return eqFolderPath
}

export function getEqualizers() {
	let defaultEqualizerPath = path.join(eqFolderPath, 'Default.json')
	let equalizers: any[] = []

	if (!fs.existsSync(eqFolderPath)) {
		fs.mkdirSync(eqFolderPath)
	}

	let equalizerFilePaths = fs.readdirSync(eqFolderPath).filter(file => file.endsWith('.json'))

	if (!fs.existsSync(defaultEqualizerPath)) {
		fs.writeFileSync(defaultEqualizerPath, EqualizerFile.stringify(defaultEqualizer))
		equalizers.push(defaultEqualizer)
	}

	equalizerFilePaths.forEach(filePath => {
		let equalizerObject: EqualizerFileObjectType = EqualizerFile.parse(
			fs.readFileSync(path.join(eqFolderPath, filePath), { encoding: 'utf8' })
		)

		if (equalizerObject === null) return
		equalizerObject.type = 'Local'

		equalizers.push(equalizerObject)
	})

	return equalizers
}

export function renameEqualizer(eqName: string, newName: string): ReturnMessageType {
	let equalizers = getEqualizers()
	let foundEq = equalizers.find(x => x.name === eqName)

	if (foundEq) {
		let newNamePath = path.join(eqFolderPath, `${newName}.json`)
		let oldNamePath = path.join(eqFolderPath, `${foundEq.name}.json`)

		foundEq.name = newName

		if (fileExistsWithCaseSyncFn(newNamePath)) {
			return {
				code: 'EXISTS',
				message: 'Profile name already exists.'
			}
		}

		try {
			fs.writeFileSync(newNamePath, EqualizerFile.stringify(foundEq))
			fs.unlinkSync(oldNamePath)

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

export function updateEqualizerValues(eqHash: string, newValues: string) {
	let equalizers = getEqualizers()

	let foundEq = equalizers.find(x => x.hash === eqHash)

	if (foundEq) {
		foundEq.values = newValues
		foundEq.hash = getStringHashFn(foundEq.name + JSON.stringify(foundEq.values))

		try {
			fs.writeFileSync(path.join(eqFolderPath, `${foundEq.name}.json`), EqualizerFile.stringify(foundEq))

			return foundEq
		} catch (error) {
			return false
		}
	}
}

export function addEqualizer(newProfile: EqualizerFileObjectType): ReturnMessageType {
	if (newProfile.name === '') {
		newProfile.name = 'Noname'
	}

	newProfile.hash = getStringHashFn(newProfile.name + JSON.stringify(newProfile.values))

	if (!fs.existsSync(path.join(eqFolderPath, `${newProfile.name}.json`))) {
		try {
			fs.writeFileSync(path.join(eqFolderPath, `${newProfile.name}.json`), EqualizerFile.stringify(newProfile))

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

export function deleteEqualizer(eqName: string): ReturnMessageType {
	let equalizers = getEqualizers()

	let foundEq = equalizers.find(x => x.name === eqName)

	if (foundEq) {
		let eqPath = path.join(eqFolderPath, `${foundEq.name}.json`)

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
	name: 'Default',
	values: {
		'32': 0,
		'64': 0,
		'128': 0,
		'256': 0,
		'512': 0,
		'1024': 0,
		'2048': 0,
		'4096': 0,
		'8192': 0,
		'16384': 0
	},
	hash: '3qu'
}
