let promiseResolve: any = undefined

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-community-equalizer-profiles', async () => {
		let profilesList: { name: string; url: string }[] = await fetchProfileList()

		let equalizerProfilesList: any[] = []

		return new Promise((resolve, reject) => {
			getEqualizersFromProfiles(profilesList, equalizerProfilesList)
			promiseResolve = resolve
		}).then(res => {
			return res
		})
	})
}

function getEqualizersFromProfiles(profilesList: { name: string; url: string }[], equalizerProfilesList: any[]) {
	let profile = profilesList.shift()

	if (profile) {
		let newProfile = {
			name: profile.name,
			values: undefined
		}

		// Verifies if the file is a json file
		if (profile.url.split('/').pop()?.split('.').pop() === 'json') {
			fetch(profile.url)
				.then(res => res.json())
				.then(data => {
					newProfile.values = data.values

					equalizerProfilesList.push(newProfile)
					getEqualizersFromProfiles(profilesList, equalizerProfilesList)
				})
		} else {
			getEqualizersFromProfiles(profilesList, equalizerProfilesList)
		}
	} else {
		promiseResolve(equalizerProfilesList)
	}
}

function fetchProfileList(): Promise<{ name: string; url: string }[]> {
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
