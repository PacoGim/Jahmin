<script lang="ts">
	import TagEditEditor from '../components/TagEdit-Editor.svelte'
	import Star from '../components/Star.svelte'

	import type { SongType } from '../types/song.type'
	import type { TagDetailType } from '../types/tagDetails.type'

	import { selectedAlbumId, selectedSongsStore } from '../store/final.store'

	import { getAlbumIPC } from '../service/ipc.service'

	let isSelectedSongsFirstAssign = true

	let songList: SongType[] = []

	const NOT_DEFINED = 'NOT_DEFINED'

	let albumTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let titleTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let trackTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let discNumberTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let albumArtistTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let genreTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let artistTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let composerTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let commentTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: ''
	}

	let dateYearTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: null
	}

	let dateMonthTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: null
	}

	let dateDayTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: null
	}

	let ratingTag: TagDetailType = {
		value: NOT_DEFINED,
		bind: 0
	}

	let previousSongList: SongType[] = undefined

	$: {
		albumTag
		titleTag
		commentTag
		trackTag
		discNumberTag
		composerTag
		genreTag
		artistTag
		albumArtistTag
		dateYearTag
		dateMonthTag
		dateDayTag
		ratingTag

		checkChanges()
	}

	$: {
		$selectedAlbumId
		$selectedSongsStore

		if (isSelectedSongsFirstAssign === true) {
			isSelectedSongsFirstAssign = false
		} else {
			checkSongs()
		}
	}

	// Check what fields are changed and creates an object with the changes.
	function checkChanges() {
		let updateObject: {
			Album?: string
			AlbumArtist?: string
			Artist?: string
			Comment?: string
			Composer?: string
			Date_Year?: number
			Date_Month?: number
			Date_Day?: number
			DiscNumber?: number
			Genre?: string
			Rating?: number
			Title?: string
			Track?: number
		} = {}

		if (titleTag.value !== titleTag.bind) {
			updateObject.Title = titleTag.bind as string
		}

		if (albumTag.value !== albumTag.bind) {
			updateObject.Album = albumTag.bind as string
		}

		if (trackTag.value !== trackTag.bind) {
			updateObject.Track = trackTag.bind as number
		}

		if (discNumberTag.value !== discNumberTag.bind) {
			updateObject.DiscNumber = discNumberTag.bind as number
		}

		if (artistTag.value !== artistTag.bind) {
			updateObject.Artist = artistTag.bind as string
		}

		if (albumArtistTag.value !== albumArtistTag.bind) {
			updateObject.AlbumArtist = albumArtistTag.bind as string
		}

		if (genreTag.value !== genreTag.bind) {
			updateObject.Genre = genreTag.bind as string
		}

		if (composerTag.value !== composerTag.bind) {
			updateObject.Composer = composerTag.bind as string
		}

		if (commentTag.value !== commentTag.bind) {
			updateObject.Comment = commentTag.bind as string
		}

		if (dateYearTag.value !== dateYearTag.bind) {
			updateObject.Date_Year = dateYearTag.bind as number
		}

		if (dateMonthTag.value !== dateMonthTag.bind) {
			updateObject.Date_Month = dateMonthTag.bind as number
		}

		if (dateDayTag.value !== dateDayTag.bind) {
			updateObject.Date_Day = dateDayTag.bind as number
		}

		if (ratingTag.value !== ratingTag.bind) {
			updateObject.Rating = ratingTag.bind as number
		}

		console.log(updateObject)
	}

	// Check either Selected Songs (if any selected) or Selected Album (if no songs selected). Then, calls group songs
	function checkSongs() {
		getAlbumIPC($selectedAlbumId).then((result) => {
			// If songs selected
			if ($selectedSongsStore.length > 0) {
				songList = result.Songs.filter((song) => $selectedSongsStore.includes(song.ID))

				// Check if song list changed.
				if (JSON.stringify(previousSongList) !== JSON.stringify(songList)) {
					groupSongs()
					previousSongList = [...songList]
				}
			} else {
				songList = result.Songs

				// Check if song list changed.
				if (JSON.stringify(previousSongList) !== JSON.stringify(songList)) {
					groupSongs()
					previousSongList = [...songList]
				}
			}
		})
	}

	function resetFields() {
		albumTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		trackTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		discNumberTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		titleTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		composerTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		genreTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		albumArtistTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		artistTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		commentTag = {
			value: NOT_DEFINED,
			bind: ''
		}

		dateYearTag = {
			value: NOT_DEFINED,
			bind: null
		}

		dateMonthTag = {
			value: NOT_DEFINED,
			bind: null
		}

		dateYearTag = {
			value: NOT_DEFINED,
			bind: null
		}

		ratingTag = {
			value: NOT_DEFINED,
			bind: 0
		}
	}

	function groupSongs() {
		resetFields()

		// Goes through every song and checks every tag. If the same tag changes value across songs, it will be set as "Multiple Values"
		// It also sets the proper values to be used on this component.
		for (let song of songList) {
			if (albumTag.value === NOT_DEFINED) {
				albumTag.value = song.Album
				albumTag.bind = song.Album
			} else if (albumTag.value !== NOT_DEFINED && song.Album !== albumTag.value) {
				albumTag.value = '(Multiple Values)'
				albumTag.bind = '(Multiple Values)'
			}

			if (titleTag.value === NOT_DEFINED) {
				titleTag.value = song.Title
				titleTag.bind = song.Title
			} else if (titleTag.value !== NOT_DEFINED && song.Title !== titleTag.value) {
				titleTag.value = '(Multiple Values)'
				titleTag.bind = '(Multiple Values)'
			}

			if (genreTag.value === NOT_DEFINED) {
				genreTag.value = song.Genre
				genreTag.bind = song.Genre
			} else if (genreTag.value !== NOT_DEFINED && song.Genre !== genreTag.value) {
				genreTag.value = '(Multiple Values)'
				genreTag.bind = '(Multiple Values)'
			}

			if (trackTag.value === NOT_DEFINED) {
				trackTag.value = song.Track
				trackTag.bind = song.Track
			} else if (trackTag.value !== NOT_DEFINED && song.Track !== trackTag.value) {
				trackTag.value = '(Multiple Values)'
				trackTag.bind = '(Multiple Values)'
			}

			if (discNumberTag.value === NOT_DEFINED) {
				discNumberTag.value = song.DiscNumber
				discNumberTag.bind = song.DiscNumber
			} else if (discNumberTag.value !== NOT_DEFINED && song.DiscNumber !== discNumberTag.value) {
				discNumberTag.value = ''
				discNumberTag.bind = ''
			}

			if (artistTag.value === NOT_DEFINED) {
				artistTag.value = song.Artist
				artistTag.bind = song.Artist
			} else if (artistTag.value !== NOT_DEFINED && song.Artist !== artistTag.value) {
				artistTag.value = '(Multiple Values)'
				artistTag.bind = '(Multiple Values)'
			}

			if (albumArtistTag.value === NOT_DEFINED) {
				albumArtistTag.value = song.AlbumArtist
				albumArtistTag.bind = song.AlbumArtist
			} else if (albumArtistTag.value !== NOT_DEFINED && song.AlbumArtist !== albumArtistTag.value) {
				albumArtistTag.value = '(Multiple Values)'
				albumArtistTag.bind = '(Multiple Values)'
			}

			if (commentTag.value === NOT_DEFINED) {
				commentTag.value = song.Comment
				commentTag.bind = song.Comment
			} else if (commentTag.value !== NOT_DEFINED && song.Comment !== commentTag.value) {
				commentTag.value = '(Multiple Values)'
				commentTag.bind = '(Multiple Values)'
			}

			if (composerTag.value === NOT_DEFINED) {
				composerTag.value = song.Composer
				composerTag.bind = song.Composer
			} else if (composerTag.value !== NOT_DEFINED && song.Composer !== composerTag.value) {
				composerTag.value = '(Multiple Values)'
				composerTag.bind = '(Multiple Values)'
			}

			if (dateYearTag.value === NOT_DEFINED) {
				dateYearTag.value = song.Date_Year
				dateYearTag.bind = song.Date_Year
			} else if (dateYearTag.value !== NOT_DEFINED && song.Date_Year !== dateYearTag.value) {
				dateYearTag.value = ''
				dateYearTag.bind = ''
			}

			if (dateMonthTag.value === NOT_DEFINED) {
				dateMonthTag.value = song.Date_Month
				dateMonthTag.bind = song.Date_Month
			} else if (dateMonthTag.value !== NOT_DEFINED && song.Date_Month !== dateMonthTag.value) {
				dateMonthTag.value = ''
				dateMonthTag.bind = ''
			}

			if (dateDayTag.value === NOT_DEFINED) {
				dateDayTag.value = song.Date_Day
				dateDayTag.bind = song.Date_Day
			} else if (dateDayTag.value !== NOT_DEFINED && song.Date_Day !== dateDayTag.value) {
				dateDayTag.value = ''
				dateDayTag.bind = ''
			}

			if (ratingTag.value === NOT_DEFINED) {
				ratingTag.value = song.Rating
				ratingTag.bind = song.Rating
			} else if (ratingTag.value !== NOT_DEFINED && song.Rating !== ratingTag.value) {
				ratingTag.value = ''
				ratingTag.bind = ''
			}
		}
	}

	function setStar(starChangeEvent) {
		ratingTag.bind = starChangeEvent.detail.starLevel
	}
</script>

<tag-edit-svlt>
	<component-name>Tag Edit</component-name>

	<TagEditEditor tagName="Title" type="input" bind:value={titleTag.bind} />
	<TagEditEditor tagName="Album" type="input" bind:value={albumTag.bind} />

	<track-disc-tag-editor>
		<TagEditEditor
			tagName="Track #"
			warningMessage={trackTag.value === '(Multiple Values)'
				? 'It is not recommended to edit the track number of multiple songs at once.'
				: undefined}
			type="number"
			placeholder="-"
			bind:value={trackTag.bind}
		/>
		<TagEditEditor tagName="Disc #" type="number" placeholder="-" bind:value={discNumberTag.bind} />
	</track-disc-tag-editor>

	<TagEditEditor tagName="Artist" type="textarea" bind:value={artistTag.bind} />
	<TagEditEditor tagName="Album Artist" type="textarea" bind:value={albumArtistTag.bind} />
	<TagEditEditor tagName="Genre" type="input" bind:value={genreTag.bind} />
	<TagEditEditor tagName="Composer" type="input" bind:value={composerTag.bind} />
	<TagEditEditor tagName="Comment" type="textarea" bind:value={commentTag.bind} />

	<date-tag-editor>
		<TagEditEditor tagName="Year" type="number" placeholder="-" bind:value={dateYearTag.bind} />
		<TagEditEditor tagName="Month" type="number" placeholder="-" bind:value={dateMonthTag.bind} />
		<TagEditEditor tagName="Day" type="number" placeholder="-" bind:value={dateDayTag.bind} />
	</date-tag-editor>

	<Star on:starChange={setStar} songRating={Number(ratingTag.bind)} />

	<button-group>
		<button>Update</button>

		<button>Cancel</button>
	</button-group>
</tag-edit-svlt>

<style>
	button-group {
		display: flex;
		justify-content: space-evenly;
	}

	button-group button {
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: none;
	}

	date-tag-editor {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}

	track-disc-tag-editor {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}

	tag-edit-svlt {
		grid-area: tag-edit-svlt;

		display: flex;
		flex-direction: column;

		background-color: rgba(0, 0, 0, 0.25);
	}

	component-name {
		text-align: center;
		padding: 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 0.5rem;
		/* font-size: .9rem; */
	}
</style>
