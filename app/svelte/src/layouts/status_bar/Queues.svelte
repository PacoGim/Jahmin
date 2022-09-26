<script lang="ts">
	import { onMount } from 'svelte'

	import generateId from '../../functions/generateId.fn'

	import tippyService from '../../services/tippy.service'

	import { artCompressQueueLength, songSyncQueueProgress } from '../../stores/main.store'

	import ImageIcon from '../../icons/ImageIcon.svelte'
	import MusicNoteIcon from '../../icons/MusicNoteIcon.svelte'
	import RefreshIcon from '../../icons/RefreshIcon.svelte'
	import notifyService from '../../services/notify.service'
	import cssVariablesService from '../../services/cssVariables.service'

	let isMounted = false

	let currentSongSyncProgress = 0
	let tippySongUpdateId = generateId()

	$: calculateProgress($songSyncQueueProgress)

	$: if (isMounted) loadSongUpdateTippy($songSyncQueueProgress.isSongUpdating)

	function calculateProgress(songSyncQueueProgress) {
		currentSongSyncProgress = 100 - Math.ceil((100 / songSyncQueueProgress.maxLength) * songSyncQueueProgress.currentLength)

		if (Math.abs(currentSongSyncProgress) === Infinity || isNaN(currentSongSyncProgress)) {
			currentSongSyncProgress = 100
		}

		cssVariablesService.set('song-sync-queue-progress', currentSongSyncProgress + 'px')
	}

	function stopSongUpdate() {
		if ($songSyncQueueProgress.isSongUpdating === true) {
			window.ipc.stopSongUpdate().then(() => {
				notifyService.success('Song update stopped')
			})
		}
	}

	function loadSongUpdateTippy(isSongUpdating) {
		if (isSongUpdating) {
			tippyService(tippySongUpdateId, 'song-update', {
				content: 'Stop songs update'
			})
		} else {
			tippyService(tippySongUpdateId, 'song-update', {
				content: 'No songs updating'
			})
		}
	}

	onMount(() => {
		isMounted = true
	})
</script>

<queue-processes>
	<art-compress-queue>
		<ImageIcon style="fill:var(--art-color-dark);height: 20px;width: 20px;margin-right: .5rem;" />
		<span>{$artCompressQueueLength}</span>
	</art-compress-queue>
	<song-sync-queue>
		<MusicNoteIcon style="fill:var(--art-color-dark);height: 20px;width: 20px;margin-right: .5rem;" />
		<span>
			{currentSongSyncProgress}%
		</span>
		<song-sync-queue-progress data-progress={currentSongSyncProgress} />
	</song-sync-queue>
	<song-update on:click={() => stopSongUpdate()}>
		<song-update-icon data-is-song-updating={$songSyncQueueProgress.isSongUpdating}>
			<RefreshIcon style="fill:var(--art-color-dark);height: 20px;width: 20px;" />
		</song-update-icon>
	</song-update>
</queue-processes>

<style>
	queue-processes {
		grid-area: queue-processes;

		display: flex;

		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}

	art-compress-queue {
		color: var(--art-color-dark);
		display: flex;
		align-items: center;

		max-height: 32px;

		background-color: var(--art-color-light);
		width: max-content;

		padding: 0.5rem;

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	song-sync-queue {
		color: var(--art-color-dark);
		display: flex;
		align-items: center;

		max-height: 32px;

		background-color: var(--art-color-light);
		width: max-content;

		padding: 0.5rem;

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}
	song-sync-queue song-sync-queue-progress {
		margin-left: 0.5rem;
		display: block;
		height: 8px;
		width: 100px;
		border-radius: 50px;
		background-color: var(--art-color-base);
		border: 1px solid var(--art-color-dark);

		transition-property: background-color, border;
		transition-timing-function: linear;
		transition-duration: 300ms;
	}

	song-sync-queue song-sync-queue-progress::before {
		content: '';
		display: block;
		height: 100%;
		width: var(--song-sync-queue-progress);
		border-radius: 50px;
		background-color: var(--art-color-dark);

		transition: background-color 300ms linear;
	}

	song-sync-queue span {
		width: 42px;
	}

	song-update {
		cursor: pointer;
		color: var(--art-color-dark);
		display: flex;
		align-items: center;

		max-height: 32px;

		background-color: var(--art-color-light);
		width: max-content;

		padding: 0.5rem;

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	song-update-icon {
		height: 20px;
		width: 20px;

		animation-name: rotate;
		animation-duration: 1500ms;
		animation-timing-function: ease-in-out;
		animation-play-state: paused;
		animation-iteration-count: infinite;
	}
	song-update-icon[data-is-song-updating='true'] {
		animation-play-state: running;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
