<script lang="ts">
	import { onMount } from 'svelte'
	import CoverArt from '../components/CoverArt.svelte'

	import Star from '../components/Star.svelte'

	import TagEditEditor from '../components/TagEdit-Editor.svelte'

	import { getEmptyTagList } from '../functions/getEmptyTagList.fn'
	import { isEmptyObject } from '../functions/isEmptyObject.fn'
	import { editTagsIPC, getTagEditProgressIPC } from '../service/ipc.service'

	import { selectedSongsStore, songListStore } from '../store/final.store'
	import type { SongType } from '../types/song.type'

	let songsToEdit: SongType[] = []
	let tagList = getEmptyTagList()
	let enableButtons = false
	let newTags: any = {}
	let rootDir = ''

	$: {
		if ($songListStore.length > 0) {
			rootDir = $songListStore[0].SourceFile.split('/').slice(0, -1).join('/')
		}
	}

	$: getSelectedSongs($selectedSongsStore, $songListStore)

	$: if (songsToEdit.length !== 0) groupSongs(songsToEdit)

	$: {
		tagList
		if (songsToEdit.length !== 0) checkNewTags()
	}

	onMount(() => {
		document.addEventListener('keypress', ({ key }) => {
			if (key === 'Enter') {
				if (document.activeElement.parentElement.tagName === 'TAG-EDIT') {
					updateSongs()
				}
			}
		})
	})

	function checkNewTags() {
		enableButtons = false
		newTags = {}

		for (let tagName in tagList) {
			if (tagList[tagName].value !== tagList[tagName].bind) {
				if (['Date_Year', 'Date_Month', 'Date_Day'].includes(tagName)) {
					newTags.Date_Year = Number(tagList.Date_Year.bind)
					newTags.Date_Month = Number(tagList.Date_Month.bind)
					newTags.Date_Day = Number(tagList.Date_Day.bind)
				} else {
					newTags[tagName] = tagList[tagName].bind
				}
			}
		}

		if (!isEmptyObject(newTags)) {
			enableButtons = true
		} else {
			enableButtons = false
		}
	}

	function getSelectedSongs(selectedSongs: number[], songList: SongType[]) {
		if (songList.length <= 0) return

		// If no songs selected, edit full array. Otherwise edit only selected songs.
		selectedSongs.length === 0
			? (songsToEdit = songList)
			: (songsToEdit = songList.filter((song) => selectedSongs.includes(song.ID)))
	}

	function groupSongs(songsToEdit: SongType[]) {
		let firstSong = songsToEdit[0]

		// Sets up the tag lists with all the tags from the first song.
		for (let tagName in firstSong) {
			if (tagList[tagName]) {
				tagList[tagName].value = firstSong[tagName]
			}
		}

		for (let song of songsToEdit) {
			for (let tagName in song) {
				if (tagList[tagName] && tagList[tagName].value !== song[tagName]) {
					tagList[tagName].value = '-'
				}
			}
		}

		for (let tagName in tagList) {
			tagList[tagName].bind = tagList[tagName].value
		}
	}

	function setStar(starChangeEvent) {
		tagList.Rating.bind = starChangeEvent.detail.starRating
	}

	function undoChange(tagName) {
		tagList[tagName].bind = tagList[tagName].value
	}

	function undoAllChanges() {
		for (let tagName in tagList) {
			tagList[tagName].bind = tagList[tagName].value
		}
	}

	function updateSongs() {
		if (enableButtons === true) {
			editTagsIPC(
				songsToEdit.map((song) => song.SourceFile),
				newTags
			)

			getTagEditProgressIPC().then((result) => console.log(result))
		}
	}
</script>

<tag-edit-svlt>
	<component-name>Songs Editing: {songsToEdit.length}</component-name>

	<TagEditEditor
		tagName="Title"
		on:undoChange={() => undoChange('Title')}
		type="text"
		bind:value={tagList.Title.bind}
		showUndo={tagList.Title.bind !== tagList.Title.value}
	/>

	<TagEditEditor
		tagName="Album"
		on:undoChange={() => undoChange('Album')}
		type="text"
		bind:value={tagList.Album.bind}
		showUndo={tagList.Album.bind !== tagList.Album.value}
	/>

	<track-disc-tag-editor>
		<TagEditEditor
			tagName="Track #"
			on:undoChange={() => undoChange('Track')}
			warningMessage={tagList.Track.value === '.'
				? 'It is not recommended to edit the track number of multiple songs at once.'
				: undefined}
			type="number"
			bind:value={tagList.Track.bind}
			showUndo={tagList.Track.bind !== tagList.Track.value}
		/>

		<TagEditEditor
			tagName="Disc #"
			on:undoChange={() => undoChange('DiscNumber')}
			type="number"
			bind:value={tagList.DiscNumber.bind}
			showUndo={tagList.DiscNumber.bind !== tagList.DiscNumber.value}
		/>
	</track-disc-tag-editor>

	<TagEditEditor
		tagName="Artist"
		on:undoChange={() => undoChange('Artist')}
		type="textarea"
		bind:value={tagList.Artist.bind}
		showUndo={tagList.Artist.bind !== tagList.Artist.value}
	/>

	<TagEditEditor
		tagName="Album Artist"
		on:undoChange={() => undoChange('AlbumArtist')}
		type="textarea"
		bind:value={tagList.AlbumArtist.bind}
		showUndo={tagList.AlbumArtist.bind !== tagList.AlbumArtist.value}
	/>

	<TagEditEditor
		tagName="Genre"
		on:undoChange={() => undoChange('Genre')}
		type="text"
		bind:value={tagList.Genre.bind}
		showUndo={tagList.Genre.bind !== tagList.Genre.value}
	/>

	<TagEditEditor
		tagName="Composer"
		on:undoChange={() => undoChange('Composer')}
		type="text"
		bind:value={tagList.Composer.bind}
		showUndo={tagList.Composer.bind !== tagList.Composer.value}
	/>

	<TagEditEditor
		tagName="Comment"
		on:undoChange={() => undoChange('Comment')}
		type="textarea"
		bind:value={tagList.Comment.bind}
		showUndo={tagList.Comment.bind !== tagList.Comment.value}
	/>

	<date-tag-editor>
		<TagEditEditor
			tagName="Year"
			on:undoChange={() => undoChange('Date_Year')}
			type="number"
			bind:value={tagList.Date_Year.bind}
			showUndo={tagList.Date_Year.bind !== tagList.Date_Year.value}
		/>
		<TagEditEditor
			tagName="Month"
			on:undoChange={() => undoChange('Date_Month')}
			type="number"
			bind:value={tagList.Date_Month.bind}
			showUndo={tagList.Date_Month.bind !== tagList.Date_Month.value}
		/>
		<TagEditEditor
			tagName="Day"
			on:undoChange={() => undoChange('Date_Day')}
			type="number"
			bind:value={tagList.Date_Day.bind}
			showUndo={tagList.Date_Day.bind !== tagList.Date_Day.value}
		/>
	</date-tag-editor>

	<Star
		on:starChange={setStar}
		on:undoChange={() => undoChange('Rating')}
		songRating={Number(tagList.Rating.bind)}
		hook="tag-edit-svlt"
		klass="tag-edit-star"
		showUndo={tagList.Rating.bind !== tagList.Rating.value}
	/>

	<cover-art>
		<!-- <CoverArt {rootDir} /> -->
	</cover-art>

	<button-group>
		<button on:click={updateSongs} class="update-button {enableButtons ? '' : 'disabled'}">Update</button>
		<button on:click={undoAllChanges} class="cancel-button {enableButtons ? '' : 'disabled'}">Cancel</button>
	</button-group>
</tag-edit-svlt>

<style>

	cover-art{
		width: 100%;
	}
	button-group {
		display: flex;
		justify-content: space-evenly;
	}

	button-group button {
		color: #fff;
		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	button-group button.update-button {
		background-color: hsl(213, 85%, 60%);
	}

	button-group button.cancel-button {
		background-color: hsl(349, 85%, 60%);
	}

	button-group button.disabled {
		cursor: not-allowed;
		background-color: #d5d5d5;
		color: #3c3c3c;
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
	}

	component-name {
		text-align: center;
		padding: 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 0.5rem;
		/* font-size: .9rem; */
	}
</style>
