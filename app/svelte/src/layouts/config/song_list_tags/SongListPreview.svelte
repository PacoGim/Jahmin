<script lang="ts">
	import SongTag from '../../../components/SongTag.svelte'
	import {
		dateOrderConfig,
		showDynamicArtistsConfig,
		showExtensionsIconsConfig,
		songListTagConfig
	} from '../../../stores/config.store'
	import type { PartialSongType } from '../../../../../types/song.type'
	import ToggleIcon from '../../../icons/ToggleIcon.svelte'
	import updateConfigFn from '../../../functions/updateConfig.fn'

	let gridStyle = ''

	let sampleSong: PartialSongType = {
		Album: 'Post Traumatic',
		AlbumArtist: 'Mike Shinoda',
		Artist: 'Mike Shinoda//Grandson',
		BitRate: 159.5405714285714,
		Comment:
			'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla libero fugiat consequuntur illo, vero repellendus dolores adipisci dolorum expedita. Quasi adipisci ut ratione molestiae minus quisquam exercitationem dicta in quos architecto nisi odit placeat, asperiores laboriosam illum? Neque porro illum eius nemo iste dolorem totam consectetur voluptatem fugiat, molestias temporibus!',
		Composer: 'Mike Shinoda',
		DateDay: 15,
		DateMonth: 6,
		DateYear: 2018,
		DiscNumber: 1,
		Duration: 204,
		Extension: 'opus',
		Genre: 'Hip hop',
		Rating: 100,
		SampleRate: 48000,
		Size: 4078741,
		Title: 'Running From My Shadow',
		Track: 13,
		PlayCount: 10
	}

	function toggleDynamicArtists() {
		updateConfigFn({
			userOptions: {
				showDynamicArtists: !$showDynamicArtistsConfig
			}
		})
	}

	function toggleExtensionsIcons() {
		updateConfigFn({
			userOptions: {
				showExtensionsIcons: !$showExtensionsIconsConfig
			}
		})
	}

	function toggleDateSelect(index: number, value: 'year' | 'day' | 'month') {
		if ($dateOrderConfig[index] === value) {
			$dateOrderConfig[index] = ''
		} else {
			$dateOrderConfig[index] = value
		}

		if ($dateOrderConfig.every(item => item === '')) {
			$dateOrderConfig[0] = 'year'
		}

		updateConfigFn({
			userOptions: {
				dateOrder: $dateOrderConfig
			}
		})
	}
</script>

<song-list-preview>
	<data-body>
		<data-row>
			{#each $songListTagConfig as tag, index (index)}
				<data-value style={`width: ${tag.width}px;`}>
					<SongTag song={sampleSong} {tag} />
				</data-value>
				<data-separator data-tag={tag.value} />
			{/each}
		</data-row>
	</data-body>

	<enable-dynamic-artists class="toggleButton">
		<button on:click={toggleDynamicArtists}>
			<span>Dynamic Artists <ToggleIcon toggle={$showDynamicArtistsConfig ? 'on' : 'off'} /></span>
		</button>
	</enable-dynamic-artists>

	<toggle-extension-icons class="toggleButton">
		<button on:click={toggleExtensionsIcons}>
			<span>Extension Icon <ToggleIcon toggle={$showExtensionsIconsConfig ? 'on' : 'off'} /></span>
		</button>
	</toggle-extension-icons>

	{#if $songListTagConfig.findIndex(item => item.value === 'Date') !== -1}
		<date-select>
			<button on:click={() => toggleDateSelect(0, 'year')}>
				<span> Year <ToggleIcon toggle={$dateOrderConfig.indexOf('year') !== -1 ? 'on' : 'off'} /> </span>
			</button>
			<button on:click={() => toggleDateSelect(1, 'month')}>
				<span> Month <ToggleIcon toggle={$dateOrderConfig.indexOf('month') !== -1 ? 'on' : 'off'} /></span>
			</button>
			<button on:click={() => toggleDateSelect(2, 'day')}>
				<span> Day <ToggleIcon toggle={$dateOrderConfig.indexOf('day') !== -1 ? 'on' : 'off'} /></span>
			</button>
		</date-select>
	{/if}
</song-list-preview>

<style>
	song-list-preview {
		width: 100%;
		display: flex;
		padding: 0 1rem;
		color: #fff;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1rem;
	}

	.toggleButton {
		display: flex;
		justify-content: center;
		width: fit-content;
		margin-top: 1rem;
	}

	.toggleButton button{
		display: flex;
		align-items: center;
		flex-direction: row;
	}

	.toggleButton button span {
		display: flex;
		align-items: center;
		flex-direction: row;
	}

	data-body {
		background-color: var(--color-fg-1);
		color: var(--color-bg-1);
		width: 100%;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 10px;
	}

	data-body data-row {
		cursor: pointer;
		min-height: var(--song-list-item-height);
		max-height: var(--song-list-item-height);
		height: var(--song-list-item-height);

		display: flex;
		align-items: center;
		justify-content: space-evenly;

		background-clip: padding-box;
		user-select: none;
		border-radius: 10px;
		transition-property: font-variation-settings, background-color, box-shadow;
		transition-duration: 250ms, 500ms, 500ms;
		transition-timing-function: ease-in-out;
	}

	data-value {
		display: inline-block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	data-container data-row data-value {
		text-align: left;
		padding: 0.25rem 0.5rem;
	}

	data-container data-header data-row data-value {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-variation-settings: 'wght' 700;
		text-align: center;
		cursor: pointer;
	}
</style>
