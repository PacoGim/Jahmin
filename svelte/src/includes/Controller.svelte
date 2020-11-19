<script lang="ts">
	import { onMount } from 'svelte'
	import { getConfig } from '../service/ipc.service'
	import { valuesToGroup } from '../store/index.store'

	onMount(() => {
		loadGrouping()
	})

	async function loadGrouping() {
		let config = await getConfig()

		if (config?.['order']?.['grouping']) {
			$valuesToGroup = config['order']['grouping']
		}
	}
</script>
