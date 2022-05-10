import { MenuItemConstructorOptions, clipboard, shell } from 'electron'
import { getConfig } from '../services/config.service'
import { sendWebContents } from '../services/sendWebContents.service'
import { SongType } from '../types/song.type'

type dataType = {
	selectedSongsData: SongType[]
	clickedSongData: SongType | undefined
	albumRootDir: string
}

export default function (data: dataType) {
	let template: MenuItemConstructorOptions[] = []

	let { selectedSongsData, clickedSongData, albumRootDir } = data

	let isClickedSongInSelectedSongs = selectedSongsData.find(song => song.ID === clickedSongData?.ID)

	/*
    1. No songs selected && No song cliked on
    2. No songs selected && Song clicked on
    3. Songs selected && No song cliked on
    4. Songs selected && Song clicked on
  */

	/*if (selectedSongsData.length === 0 && clickedSongData === undefined) {
		console.log('1. No songs selected && No song cliked on')
	} else */ if (selectedSongsData.length === 0 && clickedSongData !== undefined) {
		template.push({
			label: `Selected Song`,
			type: 'submenu',
			submenu: [
				{
					label: 'Show File'
				},
				{
					label: 'Disable'
				}
			]
		})
	} else if (selectedSongsData.length > 0 && clickedSongData === undefined) {
		console.log('3. Songs selected && No song cliked on')
	} else if (selectedSongsData.length > 0 && clickedSongData !== undefined && isClickedSongInSelectedSongs === undefined) {
		console.log('4. Songs selected && Song clicked on but not in selected songs')
	} else if (selectedSongsData.length > 0 && clickedSongData !== undefined && isClickedSongInSelectedSongs !== undefined) {
		// console.log('5. Songs selected && Song clicked on and in selected songs')
		template.push({
			label: `${cutString(clickedSongData.Title || '', 20)}`
		})

		template.push({
			label: `Show File`,
			click: () => {
				shell.showItemInFolder(clickedSongData?.SourceFile || '')
			}
		})

		template.push({
			label: `Disable Song`,
			click: () => disableSongs([clickedSongData!])
		})

		template.push({
			type: 'separator'
		})
	}

	/*
	if (selectedSongsData.length === 1 && isClickedSongInSelectedSongs) {
	}

	if (clickedSongData !== undefined) {
		template.push({
			label: `Show File: ${cutString(clickedSongData.Title || '', 20)}`,
			click: () => {
				shell.showItemInFolder(clickedSongData?.SourceFile || '')
			}
		})
	}

	// If the clicked song is present inside the selected songs.
	if (clickedSongData !== undefined && !isClickedSongInSelectedSongs) {
		template.push({
			label: `Disable: ${cutString(clickedSongData.Title || '', 26)}`,
			click: () => disableSongs([clickedSongData!])
		})
	} else if (selectedSongsData.length > 0) {
		template.push({
			label: `Disable ${selectedSongsData.length} Song${selectedSongsData.length > 1 ? 's' : ''}`,
			click: () => disableSongs(selectedSongsData)
		})
	}

  */

	template.push({
		label: 'Songs to Show',
		type: 'submenu',
		submenu: getSongAmountMenu()
	})

	template.push({
		type: 'separator'
	})

	template.push({
		label: 'Sort by',
		type: 'submenu',
		submenu: getSortMenu()
	})

	return template
}

function disableSongs(songs: SongType[]) {
	console.log(songs)
}

function cutString(str: string, maxLength: number) {
	if (str.length > maxLength) {
		return str.substring(0, maxLength) + '...'
	} else {
		return str
	}
}

function getSongAmountMenu() {
	let submenu: MenuItemConstructorOptions[] = []
	let songAmountConfig = getConfig().userOptions.songAmount

	// From 4 to 12 as song amount.
	for (let i = 4; i <= 12; i++) {
		submenu.push({
			type: 'radio',
			label: String(i),
			click: () => {
				sendWebContents('show-song-amount', i)
			},
			checked: i === songAmountConfig,
			enabled: i !== songAmountConfig
		})
	}

	return submenu
}

function getSortMenu() {
	let submenu: MenuItemConstructorOptions[] = []
	submenu.push({
		label: 'Add Sorting',
		click: () => {
			//TODO Add sorting option
		}
	})

	let options = [
		'Track',
		'Rating',
		'Title',
		'Artist',
		'Composer',
		'Date',
		'Duration',
		'Extension',
		'Genre',
		'Sample Rate',
		'Size',
		'BitRate',
		'Comment',
		'Disc #'
	]

	options.forEach(option => {
		submenu.push({
			label: option,
			type: 'submenu',
			submenu: [
				{
					label: 'Asc (A->Z)',
					click: () => {
						sendWebContents('sort-songs', {
							tag: option,
							order: 1
						})
					}
				},
				{
					label: 'Desc (Z->A)',
					click: () => {
						sendWebContents('sort-songs', {
							tag: option,
							order: -1
						})
					}
				}
			]
		})
	})

	return submenu
}
