<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import parseDuration from '../../../functions/parseDuration.fn'

	// let fieldsAmount = 1

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

	function extractTagsFromUserInput(text: string) {
		let currentFoundTag = '' // Current Tag found. Will append to it ouce a < character is found and stop when reaching >
		let foundTags = [] // All tags found
		let startAppending = false // Start or not appending to currentFoundTag variable to form a tag.

		// Iterate through every character
		for (let char of text) {
			// If an opening < character is found, start appending the rest of the tag until reaching a closing > character
			if (char === '<') {
				startAppending = true
			} else if (char === '>') {
				// Stop appending since it reached a closing > character
				startAppending = false

				// Add current formed tag "currentFoundTag" to the array
				foundTags.push(currentFoundTag)

				// Resets currentFoundTag value
				currentFoundTag = ''
			} else if (startAppending === true) {
				currentFoundTag += char
			}
		}

		return foundTags
	}

	let selectedTags = [
		{
			// 0
			name: 'Track',
			size: 'Collapse',
			align: 'Center'
		},
		{
			// 1
			name: 'Title',
			size: 'Expand',
			align: 'Left'
		}
	]

	function fooClick(e: MouseEvent) {
		let inputElement = e.composedPath().find((element: HTMLElement) => element.tagName === 'INPUT')

		if (inputElement) {
			let data = inputElement.dataset

			selectedTags[data.index][data.type] = data.value
		}
	}
</script>

<OptionSection title="Edit shown tags">
	<edit-song-string-section slot="body">
		<table on:click={e => fooClick(e)}>
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
						<td>x</td>
						<td>
							<select name="" id="">
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
		<button on:click={() => {}}>Add Field</button>
		{#each selectedTags as fooTag, index (index)}
			<p>
				{index},
				{fooTag.align},
				{fooTag.name},
				{fooTag.size}
			</p>
		{/each}
	</edit-song-string-section>
</OptionSection>

<style>
	table {
		width: max-content;

		/* display: grid; */
		/* flex-direction: column; */
		/* align-items: center; */
	}
</style>
