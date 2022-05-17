<script lang="ts">
	import { onMount } from 'svelte'
	import { getAllSongs } from '../../../db/db'
	import type { PartialSongType } from '../../../types/song.type'

	let optionBind

	let selectedTags = ['Album', 'Artist', 'Genre']

	let possibleTags = [
		{ value: 'Album', name: 'Album' },
		{ value: 'AlbumArtist', name: 'Album Artist' },
		{ value: 'Artist', name: 'Artist' },
		{ value: 'BitRate', name: 'Bit Rate' },
		{ value: 'Comment', name: 'Comment' },
		{ value: 'Composer', name: 'Composer' },
		{ value: 'Date_Day', name: 'Date Day' },
		{ value: 'Date_Month', name: 'Date Month' },
		{ value: 'Date_Year', name: 'Date Year' },
		{ value: 'DiscNumber', name: 'Disc Number' },
		{ value: 'Duration', name: 'Duration' },
		{ value: 'Extension', name: 'Extension' },
		{ value: 'Genre', name: 'Genre' },
		{ value: 'ID', name: 'ID' },
		{ value: 'Rating', name: 'Rating' },
		{ value: 'SampleRate', name: 'Sample Rate' },
		{ value: 'Size', name: 'Size' },
		{ value: 'Title', name: 'Title' },
		{ value: 'Track', name: 'Track' }
	]

	let sampleSong: PartialSongType = {
		Album: 'Nightchild',
		AlbumArtist: 'Jokabi',
		Artist: 'Jokabi',
		BitRate: 172.5405714285714,
		Comment: 'This is a comment',
		Composer: 'Jokabi',
		Date_Day: 13,
		Date_Month: 12,
		Date_Year: 2019,
		DiscNumber: 1,
		Duration: 126,
		Extension: 'opus',
		Genre: 'Lo-fi',
		ID: 459990,
		LastModified: 1649180406000,
		Rating: 4,
		SampleRate: 48000,
		Size: 2738235,
		Title: 'Forest',
		Track: 1
	}

	function addTag() {
		console.log(optionBind)
	}
</script>

<song-list-config>
	<song-list-tags>
		<select bind:value={optionBind}>
			{#each possibleTags as tag, index (index)}
				<option value={tag.value}>{tag.name}</option>
			{/each}
		</select>
		<p on:click={() => addTag()}>+</p>

		<br />

		<chosen-tag-list>
			{#each selectedTags as tag, index (index)}
				<chosen-tag
					draggable
					on:dragenter={evt => {
						console.log(evt.srcElement)
					}}
					on:dragend={evt => {
						console.log(evt)
					}}>{tag}</chosen-tag
				>
			{/each}
		</chosen-tag-list>

		<br />
		<br />
		<br />

		{#each selectedTags as tag, index (index)}
			<p>
				{sampleSong[tag]}
			</p>
		{/each}
	</song-list-tags>
</song-list-config>

<style>
	chosen-tag-list chosen-tag {
		cursor: grab;
		display: block;
		padding: 0.5rem 1rem;
		margin: 1rem 0;
		background-color: var(--color-bg-2);
	}

	chosen-tag-list chosen-tag:active {
		cursor: grabbing;
	}
</style>
