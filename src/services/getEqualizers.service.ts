import path from 'path'
import fs from 'fs'

import TOML from '@iarna/toml'

import { appDataPath } from '..'

export function getEqualizers() {
	let eqFolderPath = path.join(appDataPath(), 'eq')
	let equalizerPaths = fs.readdirSync(eqFolderPath)
	let equalizers: any[] = []

	if (!fs.existsSync(eqFolderPath)) {
		fs.mkdirSync(eqFolderPath)
		fs.writeFileSync(path.join(eqFolderPath, 'default.toml'), TOML.stringify(defaultEqualizer))
	}

	equalizerPaths.forEach(filePath => {
		if (filePath !== '.DS_Store') {
			equalizers.push(TOML.parse(fs.readFileSync(path.join(eqFolderPath, filePath), { encoding: 'utf8' })))
		}
	})

	if (equalizers.length === 0) {
		equalizers.push(defaultEqualizer)
	}

	return equalizers
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
