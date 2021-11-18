<script lang="ts">
	import { selectedSongsStore, songListStore } from '../../store/final.store'
	import { filterSongsToEdit, getObjectDifference, groupSongsByValues } from '../../services/tagEdit.service'

	import type { SongType } from '../../types/song.type'
	import Star from '../../components/Star.svelte'
	import { onMount } from 'svelte'
	import UndoIcon from '../../icons/UndoIcon.svelte'

	let songsToEdit: SongType[] = []
	let groupedTags: SongType = {}
	let bindingTags: SongType = {}

	let undoIconStyle = `
			fill:var(--color-fg-1);
			height:1rem;
		`

	let newTags: any = {}

	$: {
		$songListStore
		$selectedSongsStore
		setupSongs()
	}

	$: newTags = getObjectDifference(groupedTags, bindingTags)

	$: {
		console.log(newTags)
	}

	function setupSongs() {
		songsToEdit = filterSongsToEdit($songListStore, $selectedSongsStore)
		groupedTags = groupSongsByValues(songsToEdit)
		bindingTags = Object.assign({}, groupedTags)
	}

	function setStar(starChangeEvent) {
		bindingTags.Rating = starChangeEvent.detail.starRating
	}

	function resizeTextArea(evt: Event, type: 'expand' | 'collapse') {
		let textAreaElement = evt.target as HTMLTextAreaElement

		if (textAreaElement) {
			if (type === 'expand') {
				textAreaElement.style.minHeight = textAreaElement.scrollHeight + 'px'
			} else if (type === 'collapse') {
				textAreaElement.style.minHeight = '0px'
			}
		}
	}

	function forceNumberInput(evt: Event) {
		let inputElement = evt.target as HTMLInputElement

		if (inputElement && inputElement.value.length > 0) {
			inputElement.value = inputElement.value.replace(/[^0-9]/g, '')
		}
	}

	function checkInput(evt: Event) {
		let inputElement = evt.target as HTMLInputElement
		let inputValue = inputElement.value
		let data = inputElement.dataset

		if (inputValue === '' && groupedTags[data.tag] === null) {
			bindingTags[data.tag] = null
		}
	}

	function undoTagModification(tag: string) {
		bindingTags[tag] = groupedTags[tag]
	}

	onMount(() => {
		let textAreaElements = document.querySelector('tag-edit-svlt').querySelectorAll('textarea')
		let numberTextAreaElements = document.querySelector('tag-edit-svlt').querySelectorAll('textarea[data-type="number"]')

		numberTextAreaElements.forEach(element => {
			element.addEventListener('input', evt => forceNumberInput(evt))
		})

		textAreaElements.forEach(element => {
			element.rows = 1
			element.addEventListener('mouseleave', evt => resizeTextArea(evt, 'collapse'))
			element.addEventListener('mouseover', evt => resizeTextArea(evt, 'expand'))
			element.addEventListener('input', evt => resizeTextArea(evt, 'expand'))
			element.addEventListener('input', evt => checkInput(evt))
		})
	})
</script>

<tag-edit-svlt>
	<songs-to-edit
		>Song{songsToEdit.length > 1 ? 's' : ''} Edit{songsToEdit.length > 0 ? 'ing' : ''}: {songsToEdit.length}</songs-to-edit
	>

	<tag-title class="tag-container">
		<tag-name
			>Title {#if bindingTags.Title !== groupedTags.Title}
				<undo-container on:click={() => undoTagModification('Title')}>
					<UndoIcon style={undoIconStyle} />
				</undo-container>
			{/if}</tag-name
		>
		<textarea data-tag="Title" bind:value={bindingTags.Title} />
	</tag-title>

	<tag-album class="tag-container">
		<tag-name>Album</tag-name>
		<textarea data-tag="Album" bind:value={bindingTags.Album} />
	</tag-album>

	<tag-track class="tag-container">
		<tag-name>Track #</tag-name>
		<textarea data-tag="Track" data-type="number" bind:value={bindingTags.Track} />
	</tag-track>

	<tag-disc class="tag-container">
		<tag-name>Disc #</tag-name>
		<textarea data-tag="DiscNumber" data-type="number" bind:value={bindingTags.DiscNumber} />
	</tag-disc>

	<tag-artist class="tag-container">
		<tag-name>Artist</tag-name>
		<textarea data-tag="Artist" bind:value={bindingTags.Artist} />
	</tag-artist>

	<tag-album-artist class="tag-container">
		<tag-name>Album Artist</tag-name>
		<textarea data-tag="AlbumArtist" bind:value={bindingTags.AlbumArtist} />
	</tag-album-artist>

	<tag-genre class="tag-container">
		<tag-name>Genre</tag-name>
		<textarea data-tag="Genre" bind:value={bindingTags.Genre} />
	</tag-genre>

	<tag-composer class="tag-container">
		<tag-name>Composer</tag-name>
		<textarea data-tag="Composer" bind:value={bindingTags.Composer} />
	</tag-composer>

	<tag-comment class="tag-container">
		<tag-name>Comment</tag-name>
		<textarea data-tag="Comment" bind:value={bindingTags.Comment} />
	</tag-comment>

	<tag-date-year class="tag-container">
		<tag-name>Year</tag-name>
		<textarea data-tag="Date_Year" data-type="number" bind:value={bindingTags.Date_Year} />
	</tag-date-year>

	<tag-date-month class="tag-container">
		<tag-name>Month</tag-name>
		<textarea data-tag="Date_Month" data-type="number" bind:value={bindingTags.Date_Month} />
	</tag-date-month>

	<tag-date-day class="tag-container">
		<tag-name>Day</tag-name>
		<textarea data-tag="Date_Day" data-type="number" bind:value={bindingTags.Date_Day} />
	</tag-date-day>

	<Star on:starChange={setStar} songRating={Number(bindingTags.Rating)} hook="tag-edit-svlt" klass="tag-edit-star" />
</tag-edit-svlt>

<style>
	tag-edit-svlt {
		overflow-y: overlay;
		display: grid;
		height: max-content;

		margin: 0.5rem;

		background-color: var(--color-bg-1);

		grid-area: tag-edit-svlt;

		grid-template-areas:
			'songs-to-edit songs-to-edit songs-to-edit'
			'tag-title tag-title tag-title'
			'tag-album tag-album tag-album'
			'tag-track tag-track tag-disc'
			'tag-artist tag-artist tag-artist'
			'tag-album-artist tag-album-artist tag-album-artist'
			'tag-genre tag-genre tag-genre'
			'tag-composer	tag-composer tag-composer'
			'tag-comment	tag-comment tag-comment'
			'tag-date-year tag-date-month tag-date-day'
			'star star star';

		transition: background-color var(--theme-transition-duration) linear;
	}

	tag-edit-svlt > *.tag-container {
		font-size: 0.9rem;
		margin-bottom: 0.5rem;

		box-shadow: 0px 3px 0px 0px var(--color-fg-1);

		transition: box-shadow 300ms linear;
	}

	tag-edit-svlt > songs-to-edit {
		display: block;
		text-align: center;

		font-variation-settings: 'wght' calc(var(--default-weight) + 150);

		margin-bottom: 0.5rem;
	}

	tag-edit-svlt > *.tag-container tag-name {
		display: flex;
		align-items: center;
		justify-content: center;

		color: var(--color-fg-1);

		margin-bottom: 0.25rem;

		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		transition: color 300ms linear;
	}

	tag-edit-svlt > *.tag-container tag-name undo-container {
		cursor: pointer;
		display: flex;
	}

	tag-edit-svlt > *.tag-container textarea {
		font-size: inherit;
		padding: 0.5rem 1rem;

		color: var(--color-fg-1);
		background-color: rgba(128, 128, 128, 0.2);
		border: none;

		min-height: 0px;
		overflow-y: hidden;
		resize: none;

		font-family: 'RobotoFlex';

		width: 100%;

		transition-property: min-height, color, background-color, border-bottom-color;
		transition-duration: 300ms, var(--theme-transition-duration), var(--theme-transition-duration), 300ms;
		transition-timing-function: ease-in-out, linear, linear, linear;
	}

	tag-edit-svlt > *.tag-container textarea:focus {
		outline: none;
	}

	tag-edit-svlt > *.tag-container:focus-within {
		box-shadow: 0px 3px 0px 0px var(--color-hl-1);
	}

	songs-to-edit {
		grid-area: songs-to-edit;
	}

	tag-title {
		grid-area: tag-title;
	}

	tag-album {
		grid-area: tag-album;
	}
	tag-track {
		grid-area: tag-track;
		margin-right: 0.25rem;
	}
	tag-disc {
		grid-area: tag-disc;
		margin-left: 0.25rem;
	}
	tag-artist {
		grid-area: tag-artist;
	}
	tag-album-artist {
		grid-area: tag-album-artist;
	}
	tag-genre {
		grid-area: tag-genre;
	}
	tag-composer {
		grid-area: tag-composer;
	}
	tag-comment {
		grid-area: tag-comment;
	}
	tag-date-year {
		grid-area: tag-date-year;
		margin-right: 0.25rem;
	}
	tag-date-month {
		grid-area: tag-date-month;
		margin-right: 0.25rem;
		margin-left: 0.25rem;
	}
	tag-date-day {
		grid-area: tag-date-day;
		margin-left: 0.25rem;
	}
</style>
