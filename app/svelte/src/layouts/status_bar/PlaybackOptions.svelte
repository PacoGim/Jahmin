<script lang="ts">
	import { onMount } from 'svelte'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'
	import RepeatIcon from '../../icons/RepeatIcon.svelte'
	import RepeatOneIcon from '../../icons/RepeatOneIcon.svelte'
	import ShuffleIcon from '../../icons/ShuffleIcon.svelte'
	import {
		configStore,
		playbackRepeatCurrentConfig,
		playbackRepeatListConfig,
		playbackShuffleConfig,

		songSortConfig

	} from '../../stores/config.store'
	import { playbackStore } from '../../stores/main.store'
	import shuffleSongsFn from '../../functions/shuffleSongs.fn'
	import updateConfigFn from '../../functions/updateConfig.fn'

	function shuffleSongs(evt: Event) {
		if (evt.type === 'click') {
			if ($playbackShuffleConfig === false) {
				updateConfigFn({
					userOptions: {
						playback: {
							shuffle: true
						}
					}
				})

				shuffleSongsFn()
			} else {
				updateConfigFn({
					userOptions: {
						playback: {
							shuffle: false
						}
					}
				})
				$playbackStore = sortSongsArrayFn(
					$playbackStore,
					$songSortConfig.sortBy,
					$songSortConfig.sortOrder
				)
			}
		}
	}

	function updateRepeatCurrent() {
		updateConfigFn({
			userOptions: {
				playback: {
					repeatCurrent: !$playbackRepeatCurrentConfig
				}
			}
		})
	}

	function updateRepeatList() {
		updateConfigFn({
			userOptions: {
				playback: {
					repeatList: !$playbackRepeatListConfig
				}
			}
		})
	}

	onMount(() => {
		let shuffleSongsElement = document.querySelector('.shuffle')

		;['click', 'contextmenu'].forEach(evtType => {
			shuffleSongsElement.addEventListener(evtType, evt => shuffleSongs(evt))
		})
	})
</script>

<playback-options>
	<option-icon class="shuffle" data-is-active={$playbackShuffleConfig}>
		<ShuffleIcon style="height: 1.25rem;fill:var(--art-color-{$playbackShuffleConfig === true ? 'light' : 'dark'})" />
	</option-icon>

	<option-icon
		data-is-active={$playbackRepeatListConfig}
		on:click={() => updateRepeatList()}
		on:keypress={() => updateRepeatList()}
		tabindex="-1"
		role="button"
	>
		<RepeatIcon style="height: 1.25rem;fill:var(--art-color-{$playbackRepeatListConfig === true ? 'light' : 'dark'})" />
	</option-icon>

	<option-icon
		data-is-active={$playbackRepeatCurrentConfig}
		on:click={() => updateRepeatCurrent()}
		on:keypress={() => updateRepeatCurrent()}
		tabindex="-1"
		role="button"
	>
		<RepeatOneIcon style="height: 1.25rem;fill:var(--art-color-{$playbackRepeatCurrentConfig === true ? 'light' : 'dark'})" />
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
