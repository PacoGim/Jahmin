<script lang="ts">
	import { onMount } from 'svelte'
	import shuffleArrayFn from '../../functions/shuffleArray.fn'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'
	import RepeatIcon from '../../icons/RepeatIcon.svelte'
	import RepeatOneIcon from '../../icons/RepeatOneIcon.svelte'
	import ShuffleIcon from '../../icons/ShuffleIcon.svelte'
	import { sortByConfig, sortOrderConfig } from '../../store/config.store'
	import {
		isPlaybackRepeatEnabledStore,
		isSongRepeatEnabledStore,
		isSongShuffleEnabledStore,
		playbackStore,
		playingSongStore,
		songListStore
	} from '../../store/final.store'

	function shuffleSongs(evt: Event) {
		if (evt.type === 'click') {
			let shuffledArray = shuffleArrayFn($songListStore)

			let removedSong = shuffledArray.splice(
				shuffledArray.findIndex(song => song.ID === $playingSongStore.ID),
				1
			)

			shuffledArray.unshift(removedSong[0])

			$playbackStore = shuffledArray

			// Sets value to false first to trigger an update.
			$isSongShuffleEnabledStore = false
			$isSongShuffleEnabledStore = true
		} else if (evt.type === 'contextmenu') {
			$playbackStore = sortSongsArrayFn($playbackStore, $sortByConfig, $sortOrderConfig)
			$isSongShuffleEnabledStore = false
		}
	}

	onMount(() => {
		let shuffleSongsElement = document.querySelector('.shuffle')

		;['click', 'contextmenu'].forEach(evtType => {
			shuffleSongsElement.addEventListener(evtType, evt => shuffleSongs(evt))
		})
	})
</script>

<playback-options>
	<option-icon class="shuffle" data-is-active={$isSongShuffleEnabledStore}>
		<ShuffleIcon style="height: 1.25rem;fill:var(--{$isSongShuffleEnabledStore === true ? 'high' : 'low'}-color)" />
	</option-icon>

	<option-icon
		data-is-active={$isPlaybackRepeatEnabledStore}
		on:click={() => ($isPlaybackRepeatEnabledStore = !$isPlaybackRepeatEnabledStore)}
	>
		<RepeatIcon style="height: 1.25rem;fill:var(--{$isPlaybackRepeatEnabledStore === true ? 'high' : 'low'}-color)" />
	</option-icon>

	<option-icon
		data-is-active={$isSongRepeatEnabledStore}
		on:click={() => ($isSongRepeatEnabledStore = !$isSongRepeatEnabledStore)}
	>
		<RepeatOneIcon style="height: 1.25rem;fill:var(--{$isSongRepeatEnabledStore === true ? 'high' : 'low'}-color)" />
	</option-icon>
</playback-options>

<style>
	playback-options {
		grid-area: playback-options;
		background-color: var(--art-color-light);
		display: flex;
		align-items: center;

		height: 100%;
	}

	playback-options option-icon {
		cursor: pointer;
		display: flex;
		background-color: var(--art-color-light);
		border: 2px solid var(--art-color-dark);

		margin: 0 0.25rem;
		padding: 0.1rem;

		border-radius: 3px;

		transition: background-color 300ms linear;
	}

	option-icon[data-is-active='true'] {
		background-color: var(--art-color-dark);
	}

	playback-options option-icon:last-of-type {
		margin-right: 0.5rem;
	}

	playback-options option-icon:first-of-type {
		margin-left: 0.5rem;
	}
</style>
