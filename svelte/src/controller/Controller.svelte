<script lang="ts">
	import { onMount } from 'svelte'
	import { getConfig, saveConfig } from '../service/ipc.service'
	import { valuesToFilter, valuesToGroup, versioning } from '../store/index.store'

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
	})

	$: {
		// if first time running, saves the current filters to a variable to check later if it changed (in fn updateFilters).
		$valuesToFilter
		// console.log($valuesToFilter)
		if (isFirstRun) {
			// console.log(1)
			updatePreviousFilter()
			isFirstRun = false
		} else {
			// console.log(2)
			updateFilters()
		}
	}

	function updatePreviousFilter() {
		previousFilter = [...$valuesToFilter]
	}

	function updateFilters() {
		// if the value changed save them to config file.
		if (previousFilter.toString() !== $valuesToFilter.toString()) {
			previousFilter = [...$valuesToFilter]
			saveConfig({
				order: {
					filtering: $valuesToFilter
				}
			}).then((result) => {
				if (result === true) {
					$versioning = Date.now()
				}
			})
		}
	}

	// function saveConfig() {}

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
