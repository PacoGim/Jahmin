<script lang="ts">
	import { selectedSongsStore, songListStore } from '../../store/final.store'
	import { filterSongsToEdit, getObjectDifference, groupSongsByValues } from '../../services/tagEdit.service'

	import type { SongType } from '../../types/song.type'
	import Star from '../../components/Star.svelte'
	import { onMount } from 'svelte'

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

	onMount(() => {
		let textAreaElements = document.querySelector('tag-edit-svlt').querySelectorAll('textarea')

		textAreaElements.forEach(element => {
			element.rows = 1
			element.addEventListener('mouseleave', evt => resizeTextArea(evt, 'collapse'))
			element.addEventListener('mouseover', evt => resizeTextArea(evt, 'expand'))
			element.addEventListener('input', evt => resizeTextArea(evt, 'expand'))
		})
	})
</script>

<tag-edit-svlt>
	<p>Song Edit: {songsToEdit.length}</p>

	<tag-title>
		<p>Title</p>
		<textarea bind:value={bindingTags.Title} />
	</tag-title>

	<tag-album>
		<p>Album</p>
		<textarea bind:value={bindingTags.Album} />
	</tag-album>

	<tag-track>
		<p>Track #</p>
		<textarea bind:value={bindingTags.Track} />
	</tag-track>

	<tag-disc>
		<p>Disc #</p>
		<textarea bind:value={bindingTags.DiscNumber} />
	</tag-disc>

	<tag-artist>
		<p>Artist</p>
		<textarea bind:value={bindingTags.Artist} />
	</tag-artist>

	<tag-album-artist>
		<p>Album Artist</p>
		<textarea bind:value={bindingTags.AlbumArtist} />
	</tag-album-artist>

	<tag-genre>
		<p>Genre</p>
		<textarea bind:value={bindingTags.Genre} />
	</tag-genre>

	<tag-composer>
		<p>Composer</p>
		<textarea bind:value={bindingTags.Composer} />
	</tag-composer>

	<tag-comment>
		<p>Comment</p>
		<textarea bind:value={bindingTags.Comment} />
	</tag-comment>

	<tag-data-year>
		<p>Year</p>
		<textarea bind:value={bindingTags.Date_Year} />
	</tag-data-year>

	<tag-date-month>
		<p>Month</p>
		<textarea bind:value={bindingTags.Date_Month} />
	</tag-date-month>

	<tag-date-day>
		<p>Day</p>
		<textarea bind:value={bindingTags.Date_Day} />
	</tag-date-day>

	<Star on:starChange={setStar} songRating={Number(bindingTags.Rating)} hook="tag-edit-svlt" klass="tag-edit-star" />
</tag-edit-svlt>

<style>
	tag-edit-svlt {
		/* overflow-y: overlay; */
		display: grid;
		/* height: 100%; */

		background-color: var(--color-bg-2);

		grid-area: tag-edit-svlt;

		transition: background-color var(--theme-transition-duration) linear;
	}

	textarea {
		min-height: 0px;
		overflow-y: hidden;
		resize: none;

		font-family: 'RobotoFlex';

		width: 100%;

		transition-property: min-height, color, background-color;
		transition-duration: 300ms, var(--theme-transition-duration), var(--theme-transition-duration);
		transition-timing-function: ease-in-out, linear, linear;
	}

	textarea:focus {
		outline: none;
	}
</style>
