<script lang="ts">
	import { onMount } from 'svelte'
	import { getConfig, saveConfig } from '../service/ipc.service'
	import { valuesToFilter, isValuesToFilterChanged, valuesToGroup, dbVersion, storeConfig } from '../store/index.store'
	import { lastAlbumPlayed, lastSongIndexPlayed } from '../store/snapshot.store'

	/*
		index.store.ts -> Watch valuesToGroup and valuesToFilter changes from Order Components (Filtering)
											and Config Component (Grouping)
		When values changes -> Controller detects it and saves it to main config file.
		When config file securely saved -> Change dbVersion number in Store.
		Order watches dbVersion number.
		When dbVersion changes -> Order re-fetches the songs.
	*/

	let previousFilter = [...$valuesToFilter]
	let isFirstRun = true

	onMount(() => {
		loadConfig()

		$lastSongIndexPlayed = 0
	})

	$: {
		// if first time running, saves the current filters to a variable to check later if it changed (in fn updateFilters).
		if ($isValuesToFilterChanged === true) {
			updateFilters()
			$isValuesToFilterChanged = false
		} else {
			setPreviousFilters()
		}
	}

	function setPreviousFilters() {
		previousFilter = [...$valuesToFilter]
	}

	function updateFilters() {
		// console.log('Updating Filters')

		// if the value changed save them to config file.
		if (previousFilter.toString() !== $valuesToFilter.toString()) {
			// console.log('Saving Filters')
			previousFilter = [...$valuesToFilter]
			saveConfig({
				order: {
					filtering: $valuesToFilter
				}
			}).then((newConfig) => {
				if (newConfig) {
					$dbVersion = Date.now()
					$storeConfig = newConfig
				}
			})
		}
	}

	// function saveConfig() {}

	async function loadConfig() {
		let config = await getConfig()

		$storeConfig = { ...config }

		if (config?.['order']?.['grouping']) {
			$valuesToGroup = config['order']['grouping']
		}

		// Loads the filtering from the config file.
		// if (config?.['order']?.['filtering']) {
		// 	$valuesToFilter = config['order']['filtering']
		// }
	}
</script>
