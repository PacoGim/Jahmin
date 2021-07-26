<script>
	import { onMount } from 'svelte'

	import { getTasksToSyncIPC } from '../service/ipc.service'
	import { albumCoverArtMapStore } from '../store/final.store'

	let currentTasks = []

	onMount(() => {
		syncTasks()
	})

	function syncTasks() {
		getTasksToSyncIPC(currentTasks).then((newTasks) => {
			console.log(newTasks)
			currentTasks = newTasks
			syncTasks(currentTasks)
			workOnTasks()
		})
	}

	function workOnTasks() {
		currentTasks.forEach((task) => {
			if (task.type === 'newCoverArt') {
				$albumCoverArtMapStore.set(task.data.id, {
					version: Date.now(),
					filePath: task.data.filePath,
					fileType: task.data.fileType
				})

				task.isDone = true
			}
		})
	}
</script>
