import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'
import getStringHashFn from '../functions/getStringHash.fn'

import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

const window = new JSDOM('').window
const purify = DOMPurify(window)

let promiseResolve: any = undefined

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-community-equalizer-profiles', async () => {
		let profilesList: string[] | null = await fetchProfileList()

		if (profilesList === null) {
			return ''
		}

		let equalizerProfilesList: any[] = []

		return new Promise((resolve, reject) => {
			getEqualizersFromProfiles(profilesList!, equalizerProfilesList)
			promiseResolve = resolve
		}).then(res => {
			return res
		})
	})
}

function getEqualizersFromProfiles(profilesList: string[], equalizerProfilesList: any[]) {
	let profile = profilesList.shift()

	if (profile) {
		let newProfile: EqualizerFileObjectType = {
			name: '',
			values: undefined
		}

		fetch(profile)
			.then(res => res.json())
			.then(data => {
				newProfile.name = data.name
				newProfile.values = data.values
				newProfile.hash = getStringHashFn(newProfile.name + JSON.stringify(newProfile.values))
				newProfile.type = 'Community'

				equalizerProfilesList.push(equalizerProfileSanitize(newProfile))
				getEqualizersFromProfiles(profilesList, equalizerProfilesList)
			})
	} else {
		promiseResolve(equalizerProfilesList)
	}
}

function equalizerProfileSanitize(equalizerProfile: EqualizerFileObjectType): EqualizerFileObjectType {
	let cleanProfile: any = {
		name: '',
		values: {
			32: 0,
			64: 0,
			128: 0,
			256: 0,
			512: 0,
			1024: 0,
			2048: 0,
			4096: 0,
			8192: 0,
			16384: 0
		}
	}

	let frequencies = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384]

	cleanProfile.name = purify.sanitize(equalizerProfile.name)
	cleanProfile.hash = purify.sanitize(equalizerProfile.hash!)

	for (let frequency of frequencies) {
		let profileFrequencyValue = equalizerProfile.values?.[frequency]

		if (!isNaN(Number(profileFrequencyValue)) && profileFrequencyValue) {
			if (profileFrequencyValue > 8) {
				cleanProfile.values[frequency] = 8
			} else if (profileFrequencyValue < -8) {
				cleanProfile.values[frequency] = -8
			} else {
				cleanProfile.values[frequency] = profileFrequencyValue
			}
		} else {
			cleanProfile.values[frequency] = 0
		}
	}

	return cleanProfile
}

function fetchProfileList(): Promise<string[] | null> {
	return new Promise((resolve, reject) => {
		fetch('https://raw.githubusercontent.com/PacoGim/Jahmin-Equalizers/main/index.json')
			.then(res => res.json())
			.then(data => {
				resolve(data)
			})
			.catch(err => {
				console.log(err)
				resolve(null)
			})
	})
}
