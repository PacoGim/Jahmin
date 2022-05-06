import { selectedSongsStore, songListStore } from '../store/final.store'
import type { SongType } from '../types/song.type'

export default function (e: MouseEvent) {
	let keyModifier = {
		ctrlKey: e.ctrlKey || e.metaKey,
		shiftKey: e.shiftKey,
		altKey: e.altKey
	}

	let element = getElementFromEvent(e, 'SONG-LIST-ITEM')

	if (element === undefined) return

	let dataSet = element.dataset

	if (keyModifier.ctrlKey === false && keyModifier.shiftKey === false && keyModifier.altKey === false) {
		selectedSongsStore.set([+dataSet.id])
	}

	if (keyModifier.ctrlKey === true && keyModifier.shiftKey === false && keyModifier.altKey === false) {
		ctrlKeySelect(dataSet)
	}

	if (keyModifier.ctrlKey === false && keyModifier.shiftKey === true && keyModifier.altKey === false) {
		shiftKeySelect(dataSet)
	}

	return true
}

function shiftKeySelect(dataSet) {
	let selectedSongs: number[] = undefined
	let songList: SongType[] = undefined

	selectedSongsStore.subscribe(_ => (selectedSongs = _))
	songListStore.subscribe(_ => (songList = _))

	let selectedSongIndex = songList.findIndex(song => song.ID === +dataSet.id)
	let lastSongIndex = songList.findIndex(song => song.ID === selectedSongs.at(-1))

	for (let i = selectedSongIndex; i !== lastSongIndex; selectedSongIndex < lastSongIndex ? i++ : i--) {
		let currentId = songList[i].ID

		selectedSongs.push(currentId)
	}

	selectedSongsStore.set(selectedSongs)
}

function ctrlKeySelect(dataSet) {
	let selectedSongs = undefined

	selectedSongsStore.subscribe(_ => (selectedSongs = _))

	let index = selectedSongs.indexOf(+dataSet.id)

	if (index === -1) {
		selectedSongs.push(+dataSet.id)
	} else {
		selectedSongs.splice(index, 1)
	}

	selectedSongsStore.set(selectedSongs)
}

function getElementFromEvent(event: MouseEvent, targetElementName: string) {
	let elements = event.composedPath() as HTMLElement[]

	for (let element of elements) {
		if (element.tagName === targetElementName) {
			return element
		}
	}

	return undefined
}
