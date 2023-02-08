import { dbVersionStore } from '../stores/main.store'

let dbVersion = Date.now()
let isVersionUpdating = false

export default function () {
	dbVersion = Date.now()

	// Prevents the app from refreshing too often.
	if (isVersionUpdating === false) {
		isVersionUpdating = true
		updateStoreVersion()
	}
}

function updateStoreVersion() {
	// Saves the store value locally
	let dbVersionStoreLocal = undefined

	dbVersionStore.subscribe(value => (dbVersionStoreLocal = value))()

	if (dbVersionStoreLocal !== dbVersion) {
		dbVersionStore.set(dbVersion)

		setTimeout(() => {
			updateStoreVersion()
		}, 250)
	} else {
		isVersionUpdating = false
	}
}

