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

	let { selectedSongsData, clickedSongData } = data

	if (selectedSongsData.length !== 0 || clickedSongData !== undefined) {
		template.push({
			label: 'Enable',
			click: () => {
				handleEnableDisableSongs({ enable: true }, selectedSongsData, clickedSongData)
			}
		})

		template.push({
			label: 'Disable',
			click: () => {
				handleEnableDisableSongs({ enable: false }, selectedSongsData, clickedSongData)
			}
		})

		addSeparator(template)
	}

	template.push({
		label: 'Reveal in Folder',
		enabled: clickedSongData !== undefined,
		click: () => {
			if (clickedSongData !== undefined) {
				shell.showItemInFolder(clickedSongData.SourceFile)
			}
		}
	})

	template.push({
		label: 'Songs to Show',
		type: 'submenu',
		submenu: getSongAmountMenu()
	})

	addSeparator(template)

	template.push({
		label: 'Sort by',
		type: 'submenu',
		submenu: getSortMenu()
	})

	return template
}

function handleEnableDisableSongs(
	{ enable }: { enable: boolean },
	selectedSongs: SongType[],
	clickedSong: SongType | undefined
) {
	let isClickedSongInSelectedSongs = selectedSongs.find(song => song.ID === clickedSong?.ID) ? true : false

	if (isClickedSongInSelectedSongs === false && clickedSong !== undefined) {
		clickedSong.isEnabled = enable

		selectedSongs.push(clickedSong)
	} else if (selectedSongs.length !== 0) {
		selectedSongs.forEach(song => {
			song.isEnabled = enable
		})
	}

	selectedSongs
		.filter(song => song.hasOwnProperty('isEnabled'))
		.forEach(song => {
			sendWebContents('web-storage', {
				type: 'update',
				data: {
					id: song.ID,
					newTags: {
						isEnabled: song.isEnabled
					}
				}
			})
		})
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

	let options = getConfig().songListTags?.map(tag => tag.value)

	options?.splice(options.indexOf('DynamicArtists'), 1)
	options?.splice(options.indexOf('PlayCount'), 1, 'Play Count')
	options?.splice(options.indexOf('SampleRate'), 1, 'Sample Rate')

	let sortByConfig = getConfig().userOptions.sortBy
	let sortOrderConfig = getConfig().userOptions.sortOrder

	if (options === undefined) {
		options = [
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
	}

	options.forEach(option => {
		submenu.push({
			label: option,
			type: 'submenu',
			submenu: [
				{
					label: 'Asc (A->Z)',
					type: 'radio',
					checked: sortByConfig === option && sortOrderConfig === 'asc',
					enabled: sortByConfig !== option || sortOrderConfig !== 'asc',
					click: () => {
						sendWebContents('sort-songs', {
							tag: option,
							order: 'asc'
						})
					}
				},
				{
					label: 'Desc (Z->A)',
					type: 'radio',
					checked: sortByConfig === option && sortOrderConfig === 'desc',
					enabled: sortByConfig !== option || sortOrderConfig !== 'desc',
					click: () => {
						sendWebContents('sort-songs', {
							tag: option,
							order: 'desc'
						})
					}
				}
			]
		})
	})

	return submenu
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

function addSeparator(template: MenuItemConstructorOptions[]) {
	template.push({
		type: 'separator'
	})
}
