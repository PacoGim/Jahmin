<script>
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

	let userTextInput = ''

	$: {
		userTextInput
		updateTextPreview()
	}
	let textPreview = ''

	function updateTextPreview() {
		let tempText = userTextInput
		/*
			Song %Title% with duration %Duration%
		*/

		for (let field in data) {
			if (userTextInput.includes(`%${field}%`)) {
				tempText = tempText.replaceAll(`%${field}%`, data[field])
			}
		}

		console.log(tempText)
		textPreview = tempText
	}
</script>

<section>
	<section-title>Edit song string</section-title>
	<section-body>
		<input type="text" bind:value={userTextInput} />
		<text-preview>{textPreview}</text-preview>
	</section-body>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		/* width: 100%; */
	}

	section-title {
		width: 100%;

		font-size: 1.75rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 51);

		border-bottom: 1px white solid;
	}
</style>
