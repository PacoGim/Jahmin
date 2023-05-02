import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'
import getStringHashFn from '../functions/getStringHash.fn'

let promiseResolve: any = undefined

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-community-equalizer-profiles', async () => {
		let profilesList: string[] = await fetchProfileList()

		let equalizerProfilesList: any[] = []

		return new Promise((resolve, reject) => {
			getEqualizersFromProfiles(profilesList, equalizerProfilesList)
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



	return equalizerProfile
}

function fetchProfileList(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		fetch('https://raw.githubusercontent.com/PacoGim/Jahmin-Equalizers/main/index.json')
			.then(res => res.json())
			.then(data => {
				resolve(data)
			})
			.catch(err => {
				reject(err)
			})
	})
}
