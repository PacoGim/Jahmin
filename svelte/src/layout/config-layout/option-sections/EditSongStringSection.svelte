<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import parseDuration from '../../../functions/parseDuration.fn'

	let fieldAmount = 5
	let fieldArray = new Array(1)

	$: {
		fieldArray = new Array(fieldAmount)
	}

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
</script>

<OptionSection title="Edit shown tags">
	<table slot="body">
		<thead>
			<tr>
				<th />
				<th>Tag</th>
				<th>Size</th>
				<th>Align</th>
			</tr>
		</thead>

		<tbody>
			{#each fieldArray as _, index (index)}
				<tr id="table-row-{index}">
					<td>x</td>
					<td>
						<select name="" id="">
							{#each selectOptions as option, index (index)}
								<option value={option}>{option}</option>
							{/each}
						</select>
					</td>
					<td>
						<button>Expand</button><button>Collapse</button>
					</td>
					<td>
						<button>Left</button><button>Center</button><button>Right</button>
					</td>
				</tr>
			{/each}
		</tbody>
		<tr>
			<td><button on:click={() => fieldAmount++}>Add Field</button></td>
		</tr>
	</table>
</OptionSection>

<style>
	table {
		width: max-content;

		/* display: grid; */
		/* flex-direction: column; */
		/* align-items: center; */
	}
</style>
