<script lang="ts">
	import SaveIcon from '../../icons/SaveIcon.svelte'
	import UpdateIcon from '../../icons/UpdateIcon.svelte'
	import { currentSongProgressStore, playingSongStore } from '../../stores/main.store'

	let isEditModeOn: boolean = false
</script>

<lyrics-layout class="layout">
	<lyrics-layout-header>
		<song-information>
			{`${$playingSongStore?.Title} by ${$playingSongStore?.Artist}`}
		</song-information>

		<lyrics-controls>
			<event-wrapper on:click={()=>isEditModeOn=!isEditModeOn}>
        <UpdateIcon style="height: 1rem;fill:var(--color-fg-1)" />
      </event-wrapper>
			<SaveIcon style="height: 1rem;fill:var(--color-fg-1)" />
		</lyrics-controls>
	</lyrics-layout-header>

	<lyrics-layout-body>

    {#if isEditModeOn===true}
      <textarea/>
    {:else}

    {/if}

	</lyrics-layout-body>
</lyrics-layout>

<style>
	lyrics-layout {
		height: 100%;
		display: flex;
		/* overflow-y: hidden; */
		flex-direction: column;
	}

	lyrics-layout-body {
		height: 100%;
	}

	textarea {
		font-family: inherit;
		font-size: inherit;
		resize: vertical;
		width: 100%;
		height: 100%;
	}
</style>
