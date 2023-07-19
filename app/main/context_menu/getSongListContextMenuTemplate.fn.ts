import { MenuItemConstructorOptions, clipboard, shell } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'
import { getConfig } from '../services/config.service'
import { SongType } from '../../types/song.type'
import { saveLyrics } from '../services/lyrics.service'

import addSeparatorFn from './functions/addSeparator.fn'
import { Worker } from 'worker_threads'
import { getWorker, useWorker } from '../services/workers.service'
import { DatabaseResponseType } from '../../types/databaseWorkerMessage.type'

import handleEnableDisableSongsFn from '../functions/handleEnableDisableSongs.fn'

type dataType = {
	selectedSongsId: number[]
	clickedSongId: number | undefined
	albumRootDir: string
}

let worker: Worker

getWorker('database').then(w => (worker = w))

export default function (data: dataType) {
	return new Promise(async (resolve, reject) => {
		let template: MenuItemConstructorOptions[] = []

		let { selectedSongsId, clickedSongId } = data

		let selectedSongsDatabaseResponse: DatabaseResponseType | undefined = undefined

		let config = getConfig()

		if (selectedSongsId.length !== 0) {
			selectedSongsDatabaseResponse = await useWorker(
				{
					type: 'read',
					data: {
						queryData: {
							select: ['*'],
							orWhere: selectedSongsId.map(item => {
								return { ID: item }
							}),
							order: [`${config.userOptions.sortBy} ${config.userOptions.sortOrder}`]
						}
					}
				},
				worker
			)
		}

		let clickedSongDatabaseResponse: DatabaseResponseType = await useWorker(
			{
				type: 'read',
				data: {
					queryData: {
						select: ['*'],
						andWhere: [{ ID: clickedSongId }]
					}
				}
			},
			worker
		)

		let selectedSongsData: SongType[] = selectedSongsDatabaseResponse?.results?.data || []
		let clickedSongData: SongType = clickedSongDatabaseResponse?.results?.data?.[0]

		// If songs selected or a song has been clicked.
		if (selectedSongsId.length !== 0 || clickedSongId !== undefined) {
			let labelToShow: 'enable' | 'disable' | 'both' = 'enable'
			let songsToEnableDisable: SongType[] = []

			if (selectedSongsId.indexOf(clickedSongId!) === -1) {
				labelToShow = clickedSongData.IsEnabled === 1 ? 'disable' : 'enable'
				songsToEnableDisable = [clickedSongData]
			} else {
				if (selectedSongsData.every(song => song.IsEnabled === 1)) {
					labelToShow = 'disable'
				} else if (selectedSongsData.every(song => song.IsEnabled === 0 || song.IsEnabled === null)) {
					labelToShow = 'enable'
				} else {
					labelToShow = 'both'
				}
				songsToEnableDisable = selectedSongsData
			}

			if (['enable', 'both'].includes(labelToShow)) {
				template.push({
					label: 'Enable',
					click: () => {
						handleEnableDisableSongsFn({ enable: true }, songsToEnableDisable)
					}
				})
			}

			if (['disable', 'both'].includes(labelToShow)) {
				template.push({
					label: 'Disable',
					click: () => {
						handleEnableDisableSongsFn({ enable: false }, songsToEnableDisable)
					}
				})
			}

			addSeparatorFn(template)
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

		addSeparatorFn(template)

		template.push({
			label: 'Sort by',
			type: 'submenu',
			submenu: getSortMenu()
		})

		if (clickedSongData !== undefined) {
			addSeparatorFn(template)

			template.push({
				label: 'Show/Edit Lyrics',
				click: () => editLyrics(clickedSongData!)
			})
		}

		/*
			async() => {

				let bulkReadResponse: DatabaseResponseType = await useWorker({
					queryData: {
						select: ['*'],
						andWhere: [
							{
								Directory: data.clickedAlbum
							}
						],
						order: [`${config.userOptions.sortBy} ${config.userOptions.sortOrder}`]
					}
				},worker)

				let songs = bulkReadResponse.results.data


		*/

		template.push({
			label: 'Add to playback',
			click: () => {
				let songsToAddToPlayback: SongType[] = []

				if (selectedSongsId.indexOf(clickedSongId!) === -1) {
					songsToAddToPlayback.push(clickedSongData)
				} else {
					songsToAddToPlayback = selectedSongsData
				}

				sendWebContentsFn('song-add-to-playback', { songsToAddToPlayback })
			}
		})

		template.push({
			label: 'Play after',
			click: () => {
				sendWebContentsFn('song-play-after', { clickedSong: clickedSongData, selectedSongs: selectedSongsData })
			}
		})

		resolve(template)
	})
}

function editLyrics(song: SongType) {
	saveLyrics('SaveLyricsFromContextMenu', song.Title, song.Artist).then(() => {
		sendWebContentsFn('show-lyrics', { title: song.Title, artist: song.Artist })
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
				sendWebContentsFn('change-song-amount', i)
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
						sendWebContentsFn('sort-songs', {
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
						sendWebContentsFn('sort-songs', {
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
	// console.log(songs)
}

function cutString(str: string, maxLength: number) {
	if (str.length > maxLength) {
		return str.substring(0, maxLength) + '...'
	} else {
		return str
	}
}
