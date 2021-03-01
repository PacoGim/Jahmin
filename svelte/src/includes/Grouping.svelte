<script lang="ts">
	import { getGroupingIPC } from '../service/ipc.service'

	let selectedGroupBy = localStorage.getItem('GroupBy')
	let groups = []
  let selection

	let firstSelectedGroupByAssign = true

  $:console.log(selection)

	$: {
		selectedGroupBy

		if (firstSelectedGroupByAssign === true) {
			firstSelectedGroupByAssign = false

			// Get Grouping as soon as the variable is set.
			getGrouping()
		} else {
			if (selectedGroupBy !== localStorage.getItem('GroupBy')) {
				// Get Grouping if grouping is changed.
				getGrouping()
				localStorage.setItem('GroupBy', selectedGroupBy)

				//TODO Save to config file
			}
		}
	}

	function getGrouping() {
		getGroupingIPC(selectedGroupBy).then((result) => (groups = result))
	}

	function cutText(text: string) {
		if (text) {
			if (text.length > 20) {
				return text.substr(0, 20) + '...'
			} else {
				return text
			}
		} else {
			return text
		}
	}
</script>

<grouping-svlt>
	<select bind:value={selectedGroupBy}>
		<option value="null" disabled selected>Group by...</option>
		<option value="none">None</option>
		<option value="Genre">Genre</option>
		<option value="AlbumArtist">Album Artist</option>
	</select>

	<grouping>
		{#each groups as group, index (index)}
			<group>
				<input id={group.id} type="radio" value={group.name} bind:group={selection} />
				<label for={group.id}>{cutText(group.name)}</label>
			</group>
		{/each}
	</grouping>
</grouping-svlt>

<style>
	grouping-svlt {
		--highlight-color: rgba(255, 255, 255, 0.25);
		/* height: calc(100vh - 64px); */
	}

	select {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		font-family: inherit;
		background-color: rgba(255, 255, 255, 0.05);
		color: #fff;
		border: none;
		outline: none;
		cursor: pointer;
	}

	grouping {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		height: 100%;
		/* border-right: 1px rgba(255, 255, 255, 0.75) solid; */
		padding: 0 .5rem;
		font-size: 0.8rem;
	}

	grouping group label {
		border-radius: 5px;
		margin: 0.25rem 0;
		padding: 0 0.5rem;
		text-align: center;
		cursor: pointer;
	}

	grouping group:hover label {
		background-color: var(--highlight-color);
	}

	grouping group label {
		user-select: none;
		display: flex;
		align-items: center;
	}

	grouping item label {
		cursor: pointer;
	}

	grouping group input[type='radio'] {
		display: none;
	}

	grouping group input[type='radio'] + label::before {
		content: '●';
		font-size: 1.25rem;
		margin-right: 2px;
		opacity: 0;
	}
	grouping group input[type='radio']:checked + label {
		background-color: var(--highlight-color);
	}

	grouping group input[type='radio']:checked + label::before {
		content: '●';
		opacity: 1;
		margin-right: 2px;
	}
</style>
