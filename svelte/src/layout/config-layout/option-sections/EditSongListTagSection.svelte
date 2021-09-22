<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import { saveConfig } from '../../../service/ipc.service'
	import { songListTagsConfig } from '../../../store/config.store'
	import type { SelectedTagNameType, SelectedTagType } from '../../../types/selectedTag.type'
	import SongTag from '../../../components/SongTag.svelte'
	import tagToGridStyleFn from '../../../functions/tagToGridStyle.fn'

	let gridStyle = ''

	let selectOptions = [
		'Extension',
		'Album',
		'AlbumArtist',
		'Artist',
		'Comment',
		'Composer',
		'Date_Year',
		'Date_Month',
		'Date_Day',
		'DiscNumber',
		'Genre',
		'Rating',
		'Title',
		'Track',
		'BitRate',
		'Duration',
		'SampleRate',
		'Size'
	]

	let data = {
		Extension: 'opus',
		Album: 'Tha Blue Carpet Treatment',
		AlbumArtist: 'Snoop Dogg',
		Artist: 'Sylk E. Fine',
		Comment: 'No Comment',
		Composer: 'No Composer',
		Date_Year: 1999,
		Date_Month: 5,
		Date_Day: 11,
		DiscNumber: 0,
		Genre: 'USA',
		Rating: 0,
		Title: 'Trust Me',
		Track: 58,
		BitRate: 174.21424887169567,
		Duration: 248,
		SampleRate: 48000,
		Size: 5426420
	}

	let defaultTag: SelectedTagType = {
		name: 'Title',
		size: 'Collapse',
		align: 'Left'
	}

	let selectedTags: SelectedTagType[] = [defaultTag]

	let isFirstSaveTrigger = true

	$: {
		gridStyle = tagToGridStyleFn(selectedTags)
	}

	$: {
		selectedTags
		if (isFirstSaveTrigger === true) {
			isFirstSaveTrigger = false
		} else {
			saveConfig({
				songListTags: selectedTags
			})
			saveSelectedTagsToLS()
		}
	}

	$: if ($songListTagsConfig) selectedTags = $songListTagsConfig

	function saveSelectedTagsToLS() {
		$songListTagsConfig = selectedTags
	}

	function handleClickEvent(e: MouseEvent) {
		let inputElement = e.composedPath().find((element: HTMLElement) => element.tagName === 'INPUT') as HTMLElement

		if (inputElement) {
			let data = inputElement.dataset

			selectedTags[data.index][data.type] = data.value
		}
	}

	function handleOptionSelect(index: number) {
		let selectElement = document.querySelector(`#row-${index}-select`) as HTMLSelectElement
		selectedTags[index].name = selectElement.value as SelectedTagNameType
	}

	function addField() {
		selectedTags.push({ ...defaultTag })
		selectedTags = selectedTags
	}

	function deleteField(index: number) {
		selectedTags.splice(index, 1)

		if (selectedTags.length === 0) {
			selectedTags.push({ ...defaultTag })
		}

		selectedTags = selectedTags
	}
</script>

<OptionSection title="Edit Song List Tags">
	<edit-song-string-section slot="body">
		<table on:click={e => handleClickEvent(e)}>
			<thead>
				<tr>
					<th />
					<th>Tag</th>
					<th>Size</th>
					<th>Align</th>
				</tr>
			</thead>

			<tbody>
				{#each selectedTags as tag, index (index)}
					<tr id="table-row-{index}">
						<td class="delete-button" on:click={() => deleteField(index)}><span>X</span></td>
						<td>
							<select id="row-{index}-select" on:input={() => handleOptionSelect(index)}>
								{#each selectOptions as option, index (index)}
									<option value={option} selected={option === tag.name}>{option}</option>
								{/each}
							</select>
						</td>
						<td>
							<input
								type="radio"
								id="row-{index}-size-collapse"
								name="row-{index}-size-radio"
								checked={tag.size === 'Collapse'}
								data-index={index}
								data-type="size"
								data-value="Collapse"
							/>
							<label for="row-{index}-size-collapse">Collapse</label>

							<input
								type="radio"
								id="row-{index}-size-expand"
								name="row-{index}-size-radio"
								checked={tag.size === 'Expand'}
								data-index={index}
								data-type="size"
								data-value="Expand"
							/>
							<label for="row-{index}-size-expand">Expand</label>
						</td>
						<td>
							<input
								type="radio"
								id="row-{index}-align-left"
								name="row-{index}-align-radio"
								checked={tag.align === 'Left'}
								data-index={index}
								data-type="align"
								data-value="Left"
							/>
							<label for="row-{index}-align-left">Left</label>

							<input
								type="radio"
								id="row-{index}-align-center"
								name="row-{index}-align-radio"
								checked={tag.align === 'Center'}
								data-index={index}
								data-type="align"
								data-value="Center"
							/>
							<label for="row-{index}-align-center">Center</label>

							<input
								type="radio"
								id="row-{index}-align-right"
								name="row-{index}-align-radio"
								checked={tag.align === 'Right'}
								data-index={index}
								data-type="align"
								data-value="Right"
							/>
							<label for="row-{index}-align-right">Right</label>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<button
			class="add-field"
			on:click={() => {
				addField()
			}}>+</button
		>

		<grid-tags style="grid-template-columns:{gridStyle};">
			{#each selectedTags as selectedTag, index (index)}
				<SongTag data={data[selectedTag.name]} tagName={selectedTag.name} align={selectedTag?.align?.toLowerCase()} />
			{/each}
		</grid-tags>
	</edit-song-string-section>
</OptionSection>

<style>
	table {
		margin: 0 auto;
		border-spacing: 1.5rem 0.75rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 20);
	}
	table td {
		height: 2rem;
	}
	table thead {
		font-variation-settings: 'wght' calc(var(--default-weight) + 20);
	}
	td.delete-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		transform: scale(0.75);
		border: 2px solid #fff;
		border-radius: 3.5px;
		cursor: pointer;
	}
	td.delete-button span {
		font-size: 0.75rem;
		font-variation-settings: 'wght' 156;
	}
	td input {
		display: none;
	}
	td input:checked + label {
		color: var(--dark-theme-highlight);
		text-decoration: underline;
		font-variation-settings: 'wght' 110;
	}
	td label {
		cursor: pointer;
	}
	button.add-field {
		display: block;
		width: 2.5rem;
		height: 2.5rem;
		margin: 0 auto;
		margin-bottom: 1rem;
		border-radius: 50px;
		background-color: #057eb6;
		color: #fff;
		font-family: inherit;
		font-size: 1.5rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 10);
	}
	button.add-field:hover {
		transform: scale(0.96);
	}
	select {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 3.5px;
		background-color: transparent;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		cursor: pointer;
	}
	grid-tags {
		display: grid;
		width: 100%;
	}
</style>
