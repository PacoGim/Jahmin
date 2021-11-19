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
		bindingTags.Rating = starChangeEvent.detail.rating
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

	function forceNumberInput(element: HTMLElement) {
		let dataSet = element.dataset
		let bindingTagData = bindingTags[dataSet.tag] as string

		bindingTags[dataSet.tag] = bindingTagData.replace(/[^0-9]/g, '')
	}

	function checkInput(evt: Event, parentElement: HTMLElement) {
		let inputElement = evt.target as HTMLInputElement
		let inputValue = inputElement.value
		let data = parentElement.dataset

		if (inputValue === '' && groupedTags[data.tag] === null) {
			bindingTags[data.tag] = null
		}

		if (bindingTags[data.tag] !== groupedTags[data.tag]) {
			setUndoIconVisibility(data.tag, true)
		} else {
			setUndoIconVisibility(data.tag, false)
		}
	}

	function undoTagModification(tag: string) {
		bindingTags[tag] = groupedTags[tag]
		setUndoIconVisibility(tag, false)
	}

	function setUndoIconVisibility(query: string, isVisible: boolean) {
		let undoIconElement = document.querySelector(`svg[data-tag="${query}"]`) as HTMLElement

		if (undoIconElement) {
			undoIconElement.style.visibility = isVisible ? 'visible' : 'hidden'
		}
	}

	function hookUpEventListeners() {
		let tagContainerElements = document.querySelectorAll('tag-edit-svlt tag-container') as NodeListOf<HTMLElement>

		tagContainerElements.forEach(tagContainerElement => {
			let textAreaElement = tagContainerElement.querySelector('textarea') as HTMLTextAreaElement
			let undoIconElement = tagContainerElement.querySelector('tag-name svg') as HTMLElement
			let dataSet = tagContainerElement.dataset

			if (dataSet.type === 'number') {
				// textAreaElement.addEventListener('input', evt => forceNumberInput(evt))
				textAreaElement.addEventListener('input', evt => forceNumberInput(tagContainerElement))
			}

			textAreaElement.spellcheck = false
			textAreaElement.rows = 1
			textAreaElement.addEventListener('mouseleave', evt => resizeTextArea(evt, 'collapse'))
			textAreaElement.addEventListener('mouseover', evt => resizeTextArea(evt, 'expand'))
			textAreaElement.addEventListener('input', evt => resizeTextArea(evt, 'expand'))
			textAreaElement.addEventListener('input', evt => checkInput(evt, tagContainerElement))

			undoIconElement.setAttribute('data-tag', dataSet.tag)
			undoIconElement.style.visibility = 'hidden'
			undoIconElement.addEventListener('click', evt => undoTagModification(dataSet.tag))
		})
	}

	function sendNewTags() {
		console.log(newTags)
	}

	onMount(() => {
		hookUpEventListeners()
	})
</script>

<tag-edit-svlt>
	<songs-to-edit
		>Song{songsToEdit.length > 1 ? 's' : ''} Edit{songsToEdit.length > 0 ? 'ing' : ''}: {songsToEdit.length}</songs-to-edit
	>

	<tag-container data-tag="Title">
		<tag-name>Title <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Title} />
	</tag-container>

	<tag-container data-tag="Album">
		<tag-name>Album <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Album} />
	</tag-container>

	<tag-container data-tag="Track" data-type="number">
		<tag-name>Track # <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Track} />
	</tag-container>

	<tag-container data-tag="DiscNumber" data-type="number">
		<tag-name>Disc # <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.DiscNumber} />
	</tag-container>

	<tag-container data-tag="Artist">
		<tag-name>Artist <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Artist} />
	</tag-container>

	<tag-container data-tag="AlbumArtist">
		<tag-name>Album Artist <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.AlbumArtist} />
	</tag-container>

	<tag-container data-tag="Genre">
		<tag-name>Genre <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Genre} />
	</tag-container>

	<tag-container data-tag="Composer">
		<tag-name>Composer <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Composer} />
	</tag-container>

	<tag-container data-tag="Comment">
		<tag-name>Comment <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Comment} />
	</tag-container>

	<tag-container data-tag="Date_Year" data-type="number">
		<tag-name>Year <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Date_Year} />
	</tag-container>

	<tag-container data-tag="Date_Month" data-type="number">
		<tag-name>Month <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Date_Month} />
	</tag-container>

	<tag-container data-tag="Date_Day" data-type="number">
		<tag-name>Day <UndoIcon /> </tag-name>
		<textarea bind:value={bindingTags.Date_Day} />
	</tag-container>

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

	tag-edit-svlt tag-container {
		font-size: 0.9rem;
		margin-bottom: 0.5rem;

		box-shadow: 0px 3px 0px 0px var(--color-fg-1);

		transition: box-shadow 300ms linear;
	}

	tag-edit-svlt songs-to-edit {
		display: block;
		text-align: center;

		font-variation-settings: 'wght' calc(var(--default-weight) + 150);

		margin-bottom: 0.5rem;
	}

	tag-edit-svlt tag-container tag-name {
		display: flex;
		align-items: center;
		justify-content: center;

		color: var(--color-fg-1);

		margin-bottom: 0.25rem;

		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		transition: color 300ms linear;
	}

	tag-edit-svlt tag-container textarea {
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

	tag-edit-svlt > tag-container textarea:focus {
		outline: none;
	}

	tag-edit-svlt > tag-container:focus-within {
		box-shadow: 0px 3px 0px 0px var(--color-hl-1);
	}

	songs-to-edit {
		grid-area: songs-to-edit;
	}

	tag-container[data-tag='Title'] {
		grid-area: tag-title;
	}

	tag-container[data-tag='Album'] {
		grid-area: tag-album;
	}
	tag-container[data-tag='Track'] {
		grid-area: tag-track;
		margin-right: 0.25rem;
	}

	tag-container[data-tag='DiscNumber'] {
		grid-area: tag-disc;
		margin-left: 0.25rem;
	}

	tag-container[data-tag='Artist'] {
		grid-area: tag-artist;
	}

	tag-container[data-tag='AlbumArtist'] {
		grid-area: tag-album-artist;
	}

	tag-container[data-tag='Genre'] {
		grid-area: tag-genre;
	}

	tag-container[data-tag='Composer'] {
		grid-area: tag-composer;
	}

	tag-container[data-tag='Comment'] {
		grid-area: tag-comment;
	}

	tag-container[data-tag='Date_Year'] {
		grid-area: tag-date-year;
		margin-right: 0.25rem;
	}

	tag-container[data-tag='Date_Month'] {
		grid-area: tag-date-month;
		margin-right: 0.25rem;
		margin-left: 0.25rem;
	}

	tag-container[data-tag='Date_Day'] {
		grid-area: tag-date-day;
		margin-left: 0.25rem;
	}
</style>
