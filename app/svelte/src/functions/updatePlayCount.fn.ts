import { get } from 'svelte/store'
import { songListStore } from '../stores/main.store'

export default function (songId: number, type: 'reset' | 'increment') {
	window.ipc.updatePlayCount(songId, type).then(response => {
		let songElement = document.querySelector(`song-list-svlt data-row[data-id="${response.ID}"] song-tag playcount-tag`)

		if (songElement) {
			songElement.innerHTML = String(response.PlayCount)
		} else {
			let songListStoreLocal = get(songListStore)

			songListStoreLocal.find(song => {
				if (song.ID === response.ID) {
					song.PlayCount = response.PlayCount
				}
			})

			songListStore.set(songListStoreLocal)
		}
	})
}
