<script lang="ts">
	import { onMount } from 'svelte'
	import { getConfig } from '../service/ipc.service'
	import { valuesToFilter, valuesToGroup } from '../store/index.store'

	/*
		index.store.ts -> Watch valuesToGroup and valuesToFilter changes from Order Components (Filtering)
											and Config Component (Grouping)
		When values changes -> Controller detects it and saves it to main config file.
		When config file securely saved -> Change versioning number in Store.
		Order watches versioning number.
		When Versioning changes -> Order re-fetches the songs.
	*/

	let previousFilter = undefined
	let isFirstRun = true

	onMount(() => {
		loadConfig()
		// TODO fetch config values to group/filter
	})

	$: {
		if (isFirstRun) {
			previousFilter = $valuesToFilter
			isFirstRun = false
		} else {
			updateFilters()
		}
	}

	function updateFilters() {
		if (previousFilter.toString() !== $valuesToFilter.toString()) {
			previousFilter = $valuesToFilter
			saveConfig()
		}
	}

	function saveConfig(){

	}

	async function loadConfig() {
		let config = await getConfig()

		if (config?.['order']?.['grouping']) {
			$valuesToGroup = config['order']['grouping']
		}

		if (config?.['order']?.['filtering']) {
			$valuesToFilter = config['order']['filtering']
		}
	}
</script>
