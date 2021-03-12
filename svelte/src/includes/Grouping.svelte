<script lang="ts">
	import { getGroupingIPC } from '../service/ipc.service'
	import { dbVersion, selectedGroupByStore, selectedGroupByValueStore } from '../store/final.store'

	let selectedGroupBy = localStorage.getItem('GroupBy')
	let selectedGroupByValue = localStorage.getItem('GroupByValue')

	// let selection = selectedGroupByValue
	let groups = []

	let firstSelectedGroupByAssign = true
	let firstSelectedGroupByValueAssign = true
	let firstDbVersionAssign = true

	$: {
		$dbVersion
		if (firstDbVersionAssign === true) {
			firstDbVersionAssign = false
		} else {
			getGrouping()
		}
	}

	$: {
		selectedGroupByValue

		if (firstSelectedGroupByValueAssign === true) {
			firstSelectedGroupByValueAssign = false

			// Get Art Grid Albums as soon as the variable is set.
			$selectedGroupByValueStore = selectedGroupByValue
		} else {
			if (selectedGroupByValue !== localStorage.getItem('GroupByValue')) {
				// Get Art Grid Albums if grouping value is changed.
				$selectedGroupByValueStore = selectedGroupByValue

				localStorage.setItem('GroupByValue', selectedGroupByValue)

				//TODO Save to config file
			}
		}
	}

	$: {
		selectedGroupBy

		if (firstSelectedGroupByAssign === true) {
			firstSelectedGroupByAssign = false

			// Get Grouping as soon as the variable is set.
			getGrouping()
			$selectedGroupByStore = selectedGroupBy
		} else {
			if (selectedGroupBy !== localStorage.getItem('GroupBy')) {
				// Get Grouping if grouping is changed.
				getGrouping()
				$selectedGroupByStore = selectedGroupBy
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
		<option value="Album">Album</option>
		<option value="Composer">Composer</option>
	</select>

	<total-groups>Total {selectedGroupBy}: {groups.length}</total-groups>

	<groups>
		{#each groups as group (group.id)}
			<group>
				<input id={group.id} type="radio" value={group.name} bind:group={selectedGroupByValue} />
				<label for={group.id}>{group.name}</label>
			</group>
		{/each}
	</groups>
</grouping-svlt>

<style>
	grouping-svlt {
		--highlight-color: rgba(255, 255, 255, 0.25);

		grid-area: grouping-svlt;

		display: flex;
		flex-direction: column;

		height: 100%;
	}

	grouping-svlt select {
		display: block;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		font-family: inherit;
		background-color: rgba(255, 255, 255, 0.05);
		color: #fff;
		border: none;
		outline: none;
		cursor: pointer;
		width: 100%;
	}

	grouping-svlt total-groups {
		text-align: center;
		padding: 0.5rem;
		margin: 0.5rem;
		border-radius: 5px;
		font-size: 0.85rem;
		background-color: rgba(255, 255, 255, 0.1);
	}

	groups {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		height: 100%;
		padding: 0 0.5rem;
		font-size: 0.85rem;
	}

	groups group {
		width: 192px;
		margin: 0.25rem 0;
	}

	groups group label {
		padding: 0.5rem;
		border-radius: 5px;
		cursor: pointer;
		display: block;

		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	groups group:hover label {
		background-color: var(--highlight-color);
	}

	groups group label {
		user-select: none;
	}

	groups group input[type='radio'] {
		display: none;
	}

	groups group input[type='radio'] + label::before {
		content: '●';
		margin-right: 10px;
		opacity: 0;

		transition: opacity 300ms ease-in-out;
	}
	groups group input[type='radio']:checked + label {
		background-color: var(--highlight-color);
	}

	groups group input[type='radio']:checked + label::before {
		content: '●';
		opacity: 1;
	}
</style>
