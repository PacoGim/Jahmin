<script lang="ts">
	import { onMount } from 'svelte'
	import { promptService } from '../../stores/service.store'
	import type { PromptStateType } from '../../../../types/promptState.type'

	function showPrompt() {
		let promptState: PromptStateType = {
			cancelButtonText: 'Cancel',
			confirmButtonText: 'Create new list',
			placeholder: 'Platlist name',
			title: 'Create new playlist',
			data: {},
			validateFn
		}

		$promptService.showPrompt(promptState)
	}

	function validateFn(value: string) {
		return {
			isValid: false,
			errorMessage: ''
		}
	}
</script>

<playlist-list-svlt>
	<create-new-list>
		<button on:click={showPrompt}>Create new playlist</button>
	</create-new-list>
</playlist-list-svlt>

<style>
</style>
