import { dbVersionStore } from '../stores/main.store'

let dbVersion = 0
let isVersionUpdating = false

export default function () {
	dbVersion++

	if (isVersionUpdating === false) {
		isVersionUpdating = true
		updateStoreVersion()
	}
}

function updateStoreVersion() {
	let dbVersionStoreLocal = undefined

	dbVersionStore.subscribe(value => (dbVersionStoreLocal = value))()

	if (dbVersionStoreLocal !== dbVersion) {
		dbVersionStore.set(dbVersion)

		setTimeout(() => {
			updateStoreVersion()
		}, 500)
	} else {
		isVersionUpdating = false
	}
}
