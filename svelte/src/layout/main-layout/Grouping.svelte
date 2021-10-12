<script lang="ts">
	import { getGroupingIPC } from '../../service/ipc.service'
	import {
		albumPlayingIdStore,
		dbVersion,
		selectedGroupByStore,
		selectedGroupByValueStore,
		triggerGroupingChangeEvent
	} from '../../store/final.store'

	let selectedGroupBy = localStorage.getItem('GroupBy')
	let selectedGroupByValue = localStorage.getItem('GroupByValue')

	// let selection = selectedGroupByValue
	let groups = []

	let firstSelectedGroupByAssign = true
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
		if ($triggerGroupingChangeEvent !== '') {
			setPlayingSongGroupingValue()
			$triggerGroupingChangeEvent = ''
		}
	}

	function setPlayingSongGroupingValue() {
		console.log($triggerGroupingChangeEvent)
		selectedGroupByValue = $triggerGroupingChangeEvent
	}

	$: {
		$albumPlayingIdStore
		saveCurrentPlayingGroup()
	}

	$: {
		// Get Art Grid Albums as soon as the variable is set.
		$selectedGroupByValueStore = selectedGroupByValue
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
			}
		}
	}

	function getGrouping() {
		getGroupingIPC(selectedGroupBy).then(result => {
			groups = result

			setTimeout(() => {
				try {
					let inputRadioValue = document
						.querySelector('grouping-svlt groups')
						.querySelector("input[type='radio']:checked")
						.getAttribute('value')

					document.querySelector(`group[name=${inputRadioValue}]`).scrollIntoView({ block: 'center' })
				} catch {}
			}, 100)
		})
	}

	function saveCurrentPlayingGroup() {
		localStorage.setItem('GroupByValue', selectedGroupByValue)
	}
</script>

<grouping-svlt>
	<select bind:value={selectedGroupBy}>
		<option value="null" disabled selected>Group by...</option>
		<option value="Genre">Genre</option>
		<option value="AlbumArtist">Album Artist</option>
		<option value="Album">Album</option>
	</select>

	<total-groups>Total {selectedGroupBy}: {groups.length}</total-groups>

	<groups>
		{#each groups as group (group.id)}
			<group name={group.name}>
				<input id={group.id} type="radio" value={group.name} bind:group={selectedGroupByValue} />
				<label for={group.id}>{group.name}</label>
			</group>
		{/each}
	</groups>
</grouping-svlt>

<style>
	grouping-svlt {
		grid-area: grouping-svlt;

		display: flex;
		flex-direction: column;

		height: 100%;

		color: var(--color-fg-1);
	}

	grouping-svlt select {
		display: block;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		font-family: inherit;
		background-color: var(--color-bg-2);
		border: none;
		outline: none;
		cursor: pointer;
		width: 100%;

		color: inherit;
	}

	grouping-svlt total-groups {
		text-align: center;
		padding: 0.5rem;
		margin: 0.5rem;
		border-radius: 5px;
		font-size: 0.85rem;
		background-color: var(--color-bg-2);
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
		background-color: var(--color-bg-2);
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
		background-color: var(--color-bg-2);
	}

	groups group input[type='radio']:checked + label::before {
		content: '●';
		opacity: 1;
	}
</style>
