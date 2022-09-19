<script lang="ts">
	import {
		elementMap,
		selectedAlbumDir,
		selectedSongsStore,
		songListStore,
		songSyncQueueProgress
	} from '../../stores/main.store'

	import { filterSongsToEdit, getObjectDifference, groupSongsByValues } from '../../services/tagEdit.service'

	import type { PartialSongType } from '../../../../types/song.type'
	import Star from '../../components/Star.svelte'
	import { onMount } from 'svelte'
	import UndoIcon from '../../icons/UndoIcon.svelte'
	import AlbumArt from '../../components/AlbumArt.svelte'
	import UpdateIcon from '../../icons/UpdateIcon.svelte'
	import { isEmptyObject } from '../../functions/isEmptyObject.fn'
	import tagEditSuggestionFn from '../../services/tagEditSuggestion.fn'

	let songsToEdit: PartialSongType[] = []
	let groupedTags: PartialSongType = {}
	let bindingTags: PartialSongType = {}

	let newTags: any = {}

	$: {
		$songListStore
		setupSongs('songListStoreUpdate')
	}

	$: {
		$selectedSongsStore
		setupSongs('selectedSongsStoreUpdate')
	}

	$: newTags = getObjectDifference(groupedTags, bindingTags)

	function setupSongs(from: string) {
		if (from === 'songListStoreUpdate' && $songSyncQueueProgress.currentLength > 0) {
			return
		}

		songsToEdit = filterSongsToEdit($songListStore, $selectedSongsStore)
		groupedTags = groupSongsByValues(songsToEdit)
		bindingTags = Object.assign({}, groupedTags)
	}

	function setStar(starChangeEvent) {
		let newRating = starChangeEvent.detail.rating

		bindingTags.Rating = newRating

		if (newRating === '' && groupedTags['Rating'] === null) {
			bindingTags['Rating'] = null
		}

		if (bindingTags['Rating'] !== groupedTags['Rating']) {
			setUndoIconVisibility('Rating', { isVisible: true })
		} else {
			setUndoIconVisibility('Rating', { isVisible: false })
		}
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

	function checkInput(inputElement: HTMLTextAreaElement | HTMLInputElement, parentElement: HTMLElement) {
		let inputValue = inputElement.value
		let data = parentElement.dataset

		if (inputValue === '' && groupedTags[data.tag] === null) {
			bindingTags[data.tag] = null
		}

		if (bindingTags[data.tag] !== groupedTags[data.tag]) {
			setUndoIconVisibility(data.tag, { isVisible: true })
		} else {
			setUndoIconVisibility(data.tag, { isVisible: false })
		}
	}

	function suggestTags(evt: Event, parentElement: HTMLElement) {
		let inputElement = evt.target as HTMLInputElement
		let inputValue = inputElement.value
		let data = parentElement.dataset

		tagEditSuggestionFn(inputElement.parentElement, data.tag, inputValue).then((result: string) => {
			if (result) {
				console.log(result)
				bindingTags[data.tag] = result
			}
		})
	}

	function undoTagModification(tag: string) {
		bindingTags[tag] = groupedTags[tag]
		setUndoIconVisibility(tag, { isVisible: false })
	}

	function setUndoIconVisibility(query: string, { isVisible }: { isVisible: boolean }) {
		let undoIconElement = document.querySelector(`svg[data-tag="${query}"]`) as HTMLElement

		if (undoIconElement) {
			undoIconElement.style.opacity = isVisible ? '1' : '0'
			undoIconElement.style.pointerEvents = isVisible ? 'all' : 'none'
		}
	}

	function removeSuggestedTags(textAreaElement: HTMLElement) {
		let eventTargetTagSuggestionElement = textAreaElement.parentElement.querySelector('tag-suggestions')

		if (eventTargetTagSuggestionElement) {
			eventTargetTagSuggestionElement.innerHTML = ''
		}
	}

	function hookUpEventListeners() {
		let tagContainerElements = document.querySelectorAll('tag-edit-svlt tag-container') as NodeListOf<HTMLElement>

		tagContainerElements.forEach(tagContainerElement => {
			let textAreaElement = tagContainerElement.querySelector('textarea') as HTMLTextAreaElement
			let undoIconElement = tagContainerElement.querySelector('svg') as SVGElement
			let dataSet = tagContainerElement.dataset

			if (dataSet.type === 'number') {
				textAreaElement.addEventListener('input', evt => forceNumberInput(tagContainerElement))
			}

			if (textAreaElement) {
				textAreaElement.spellcheck = false
				textAreaElement.rows = 1
				textAreaElement.addEventListener('mouseleave', evt => resizeTextArea(evt, 'collapse'))
				textAreaElement.addEventListener('mouseover', evt => resizeTextArea(evt, 'expand'))
				textAreaElement.addEventListener('input', evt => resizeTextArea(evt, 'expand'))
				textAreaElement.addEventListener('input', evt => checkInput(evt.target as HTMLInputElement, tagContainerElement))
				textAreaElement.addEventListener('input', evt => suggestTags(evt, tagContainerElement))

				textAreaElement.addEventListener('focus', evt => {
					setTimeout(() => {
						suggestTags(evt, tagContainerElement)
					}, 100)
				})

				textAreaElement.addEventListener('focusout', evt => {
					setTimeout(() => {
						removeSuggestedTags(evt.target as HTMLElement)
					}, 100)
				})

				textAreaElement.addEventListener('keydown', evt => {
					if (['ArrowDown', 'ArrowUp', 'Escape', 'Enter'].includes(evt.key)) {
						if (evt.key === 'Enter') evt.preventDefault()
						selectSuggestion(evt.target as HTMLTextAreaElement, evt.key as 'ArrowDown' | 'ArrowUp' | 'Enter')
					}
				})
			}

			if (undoIconElement) {
				undoIconElement.setAttribute('data-tag', dataSet.tag)
				undoIconElement.style.position = 'absolute'
				undoIconElement.style.right = '0'
				undoIconElement.style.transform = 'translateX(calc(1rem + 2px))'
				undoIconElement.style.opacity = '0'
				undoIconElement.addEventListener('click', evt => undoTagModification(dataSet.tag))
			}
		})
	}

	function selectSuggestion(targetElement: HTMLTextAreaElement, keyPressed: 'ArrowDown' | 'ArrowUp' | 'Enter' | 'Escape') {
		let suggestionElements = targetElement.parentElement.querySelector('tag-suggestions') as HTMLElement

		if (keyPressed === 'Enter') {
			let selectedSuggestion = suggestionElements.querySelector('tag-suggestion.selected') as HTMLElement
			let data = selectedSuggestion?.dataset

			if (selectedSuggestion && data.tag && data.content) {
				bindingTags[data.tag] = data.content
			}

			removeSuggestedTags(targetElement)

			checkInput(targetElement, targetElement.parentElement)

			return
		}

		if (keyPressed === 'Escape') {
			targetElement.blur()

			return
		}

		if (suggestionElements.dataset.index === undefined) {
			suggestionElements.dataset.index = '-1'
		}

		if (keyPressed === 'ArrowDown') {
			suggestionElements.dataset.index = String(Number(suggestionElements.dataset.index) + 1)
		} else if (keyPressed === 'ArrowUp') {
			suggestionElements.dataset.index = String(Number(suggestionElements.dataset.index) - 1)
		}

		let suggestionElement = suggestionElements.querySelector(
			`tag-suggestion[data-index="${suggestionElements.dataset.index}"]`
		) as HTMLElement

		if (suggestionElement === null) {
			suggestionElement = suggestionElements.querySelector(`tag-suggestion[data-index="0"]`) as HTMLElement
			suggestionElements.dataset.index = '0'

			if (suggestionElement === null) return
		}

		suggestionElements.querySelectorAll('tag-suggestion').forEach(suggestion => {
			suggestion.classList.remove('selected')
		})

		suggestionElement.classList.add('selected')
	}

	function undoAllTags() {
		for (let tag in bindingTags) {
			undoTagModification(tag)
		}
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

	<tag-container data-tag="Rating">
		<tag-name>Rating <UndoIcon /> </tag-name>
		<Star on:starChange={setStar} songRating={Number(bindingTags.Rating)} hook="tag-edit-svlt" klass="tag-edit-star" />
	</tag-container>

	<album-art>
		<AlbumArt imageSourceLocation={songsToEdit[0]?.SourceFile} intersectionRoot={undefined} />
	</album-art>

	<button-container>
		<button class="danger" on:click={() => undoAllTags()} disabled={isEmptyObject(newTags)}>
			<UndoIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;opacity: 1;" />
			Cancel
		</button>
		<button
			class="info"
			on:click={() => {
				window.ipc.updateSongs(songsToEdit, newTags)
				$elementMap = undefined
			}}
			disabled={isEmptyObject(newTags)}
		>
			<UpdateIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
			Update
		</button>
	</button-container>
</tag-edit-svlt>

<style>
	tag-edit-svlt {
		background-color: rgba(255, 255, 255, 0.2);

		overflow-y: overlay;
		display: grid;
		height: 100%;

		grid-template-rows: repeat(12, max-content) auto;

		/* margin: 0 0.5rem; */
		padding: 0 0.5rem;

		/* background-color: rgba(var(--rgb-global), 0.025); */

		/* background-color: var(--color-bg-1); */

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
			'tag-rating tag-rating tag-rating'
			'album-art album-art album-art'
			'button-container button-container button-container';

		transition: background-color var(--theme-transition-duration) linear;
	}

	tag-edit-svlt tag-container {
		display: flex;
		flex-direction: column;
		align-items: center;

		position: relative;

		font-size: 0.9rem;
		margin-bottom: 0.5rem;

		box-shadow: 0px 3px 0px 0px var(--color-fg-1);

		transition: box-shadow 300ms linear;
	}

	tag-edit-svlt songs-to-edit {
		display: block;
		text-align: center;

		font-size: 0.8rem;

		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		margin: 0.5rem 0;
	}

	tag-edit-svlt tag-container tag-name {
		position: relative;

		width: max-content;

		color: var(--color-fg-1);

		margin-bottom: 0.25rem;

		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		transition: color 300ms linear;
	}

	tag-edit-svlt tag-container textarea {
		font-size: inherit;
		padding: 0.5rem 0.65rem;

		color: var(--color-fg-1);
		background-color: rgba(128, 128, 128, 0.2);
		border: none;

		min-height: 0px;
		overflow-y: hidden;
		resize: none;

		width: 100%;

		transition-property: min-height, color, background-color, border-bottom-color;
		transition-duration: 300ms, var(--theme-transition-duration), var(--theme-transition-duration), 300ms;
		transition-timing-function: ease-in-out, linear, linear, linear;
	}

	tag-edit-svlt > tag-container textarea:focus {
		outline: none;
	}

	tag-edit-svlt > tag-container:focus-within {
		box-shadow: 0px 3px 0px 0px var(--color-hl-gold);
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

	tag-container[data-tag='Rating'] {
		grid-area: tag-rating;
		box-shadow: none;
	}

	album-art {
		grid-area: album-art;
		width: 100%;
	}

	button-container {
		grid-area: button-container;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		align-items: end;
		margin: .5rem 0;
	}

	:global(tag-suggestions) {
		position: absolute;
		background-color: var(--color-fg-1);
		color: var(--color-bg-1);

		z-index: 1;

		top: 100%;
		width: 100%;
	}

	:global(tag-suggestions tag-suggestion) {
		display: flex;
		padding: 0.5rem 1rem;
		cursor: pointer;

		transition-property: color, background-color;
		transition-timing-function: linear;
		transition-duration: 100ms;
	}

	:global(tag-suggestions tag-suggestion:focus),
	:global(tag-suggestions tag-suggestion.selected),
	:global(tag-suggestions tag-suggestion:hover) {
		background-color: var(--color-bg-1);
		color: var(--color-fg-1);
	}

	:global(tag-suggestions tag-suggestion::after) {
		content: attr(data-content);
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
