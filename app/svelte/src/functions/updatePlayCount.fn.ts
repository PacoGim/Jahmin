export default function (songId: number, type: 'reset' | 'increment') {
	window.ipc.updatePlayCount(songId, type).then(response => {
		let songElement = document.querySelector(`song-list-item[data-id="${response.ID}"] song-tag playcount-tag`)

		if (songElement) songElement.innerHTML = String(response.PlayCount)
	})
}
