<script lang="ts">
	import { getAlbumsIPC } from '../service/ipc.service'

	import { albumListStore, selectedGroupByStore, selectedGroupByValueStore } from '../store/final.store'

	let firstGroupByAssignments = true

	$: {
		if (firstGroupByAssignments === true) {
			firstGroupByAssignments = false
		} else {
			getAlbums($selectedGroupByStore, $selectedGroupByValueStore)
		}
	}

	function getAlbums(groupBy: string, groupByValue: string) {
		getAlbumsIPC(groupBy, groupByValue).then((result) => ($albumListStore = result))
	}
</script>
