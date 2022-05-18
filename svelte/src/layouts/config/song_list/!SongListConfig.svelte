<script lang="ts">
	import { onMount } from 'svelte'
	import { getAllSongs } from '../../../db/db'
	import MoveIcon from '../../../icons/MoveIcon.svelte'
	import type { PartialSongType } from '../../../types/song.type'

	let optionBind

	let selectedTags = [
		{ value: 'Album', isExpanded: false, align: 'center' },
		{ value: 'Artist', isExpanded: true, align: 'center' },
		{ value: 'Genre', isExpanded: false, align: 'center' }
	]

	$: {
		console.log(selectedTags)
	}

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

	function getTagNameFromValue(value: string) {
		return possibleTags.find(tag => tag.value === value).name
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

		<!-- <chosen-tag
			draggable
			on:dragenter={evt => {
				console.log(evt.srcElement)
			}}
			on:dragend={evt => {
				console.log(evt)
			}}>{tag}</chosen-tag
		> -->

		<selected-tags-list>
			{#each selectedTags as tag, index (index)}
				<selected-tag
					draggable
					on:dragenter={evt => {
						console.log(evt.srcElement)
					}}
				>
					<tag-name>{getTagNameFromValue(tag.value)}</tag-name>
					<select bind:value={selectedTags[index].value}>
						{#each possibleTags as tag, index (index)}
							<option value={tag.value}>{tag.name}</option>
						{/each}
					</select>
					<tag-empty-space />
					<tag-expand data-is-expanded={selectedTags[index].isExpanded}>
						<input id="{index}-{tag.value}-expand" type="checkbox" bind:checked={selectedTags[index].isExpanded} />
						<label for="{index}-{tag.value}-expand">Expanded</label>
					</tag-expand>

					<tag-aligns data-is-active={selectedTags[index].isExpanded}>
						<tag-align-left class="tag-align">
							<input id="{index}-{tag.value}-l" type="radio" bind:group={selectedTags[index].align} value="left" />
							<label for="{index}-{tag.value}-l">L</label>
						</tag-align-left>

						<tag-align-center class="tag-align">
							<input id="{index}-{tag.value}-c" type="radio" bind:group={selectedTags[index].align} value="center" />
							<label for="{index}-{tag.value}-c">C</label>
						</tag-align-center>

						<tag-align-right class="tag-align">
							<input id="{index}-{tag.value}-r" type="radio" bind:group={selectedTags[index].align} value="right" />
							<label for="{index}-{tag.value}-r">R</label>
						</tag-align-right>
					</tag-aligns>

					<move-icon>
						<MoveIcon style="height: 1.25rem;fill:var(--color-fg-1);margin-left: 1rem;" />
					</move-icon>
				</selected-tag>
			{/each}
		</selected-tags-list>

		<br />
		<br />
		<br />

		{#each selectedTags as tag, index (index)}
			<p>
				{sampleSong[tag.value]}
			</p>
		{/each}
	</song-list-tags>
</song-list-config>

<style>
	song-list-config {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	selected-tags-list {
		display: block;
		width: var(--clamp-width);
	}

	selected-tags-list selected-tag {
		display: grid;
		align-items: center;
		grid-template-columns: max-content auto repeat(3, max-content);
		cursor: grab;
		padding: 0.5rem 1rem;
		margin: 1rem 0;
		background-color: var(--color-bg-2);
	}

	selected-tags-list selected-tag:active {
		cursor: grabbing;
	}

	selected-tag tag-name {
		grid-area: 1 / 1;
		cursor: pointer;
	}

	selected-tag select {
		cursor: pointer;
		grid-area: 1 / 1;
		height: 100%;
		opacity: 0;
	}

	selected-tag tag-empty-space {
		display: block;
		height: 100%;
	}

	selected-tag tag-expand label {
		cursor: pointer;
		font-size: 0.9rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
		border: 2px solid var(--color-fg-1);
		padding: 0.15rem 0.3rem;
		border-radius: 3px;
		margin-right: 1rem;

		display: inline-block;

		transition-property: background-color, color, border-color, transform;
		transition-duration: 300ms;
		transition-timing-function: linear;

		transform: translateX(7.5rem);
	}

	selected-tag tag-expand[data-is-expanded='true'] label {
		background-color: var(--color-hl-1);
		color: var(--color-bg-1);
		border-color: var(--color-hl-1);
		transform: translateX(0rem);
	}

	selected-tag tag-expand input {
		display: none;
	}

	selected-tag tag-aligns {
		display: flex;
		flex-direction: row;
		width: calc(28 * 4px);
		justify-content: space-around;
	}

	selected-tag tag-aligns .tag-align label {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.9rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
		border: 2px solid var(--color-fg-1);
		border-radius: 3px;
	}

	:where(selected-tag tag-aligns .tag-align label) {
		transition: transform 200ms ease-in-out;
	}

	selected-tag tag-aligns tag-align-left label {
		transition-delay: 0ms;
	}

	selected-tag tag-aligns tag-align-center label {
		transition-delay: 100ms;
	}

	selected-tag tag-aligns tag-align-right label {
		transition-delay: 200ms;
	}

	selected-tag tag-aligns .tag-align {
		display: block;
		height: 28px;
		width: 28px;
	}

	selected-tag tag-aligns[data-is-active='false'] .tag-align label {
		transform: rotateY(90deg);
	}
	selected-tag tag-aligns[data-is-active='true'] .tag-align label {
		transform: rotateY(0deg);
	}

	selected-tag tag-aligns .tag-align input:checked ~ label {
		background-color: var(--color-hl-1);
		color: var(--color-bg-1);
		border-color: var(--color-hl-1);
	}

	selected-tag tag-aligns .tag-align input {
		display: none;
	}

	selected-tag move-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
