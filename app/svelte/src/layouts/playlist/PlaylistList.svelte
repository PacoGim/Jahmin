<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	import { promptService } from '../../stores/service.store'
	import notifyService from '../../services/notify.service'

	import type { PromptStateType } from '../../../../types/promptState.type'

	import validateSafeFileCharsFn from '../../functions/validateSafeFileChars.fn'

	const dispatch = createEventDispatcher()

	let playlistList: string[] = []

	function showPrompt(inputValue: string = undefined) {
		let promptState: PromptStateType = {
			cancelButtonText: 'Cancel',
			confirmButtonText: 'Create new list',
			placeholder: 'Playlist name',
			title: 'Create new playlist',
			data: {
				inputValue: inputValue || ''
			},
			validateFn: validateSafeFileCharsFn
		}

		$promptService.showPrompt(promptState).then(propmtResponse => {
			window.ipc.createNewPlaylist(propmtResponse.data.result).then(response => {
				$promptService.closePrompt()
				if (response.code === 0) {
					notifyService.success(response.message)

					playlistList.push(response.data.fileName)
					playlistList = playlistList
				} else {
					notifyService.error(response.message)
					showPrompt(propmtResponse.data.result)
				}
			})
		})
	}

	function handlePlaylistClick(listName: string) {
		dispatch('selectedPlaylist', listName)
	}

	onMount(() => {
		window.ipc.fetchPlaylistList().then(response => {
			if (response.code === 0) {
				playlistList = response.data
			}
		})
	})
</script>

<playlist-list-svlt>
	<create-new-list>
		<button on:click={() => showPrompt()}>Create new playlist</button>
	</create-new-list>

	<item-list>
		{#each playlistList as listName, index (index)}
			<button class="no-style" on:click={() => handlePlaylistClick(listName)}>{listName}</button>
		{/each}
	</item-list>
</playlist-list-svlt>

<style>
</style>
