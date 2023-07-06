<script lang="ts">
	import SongTag from '../../../components/SongTag.svelte'
	import tagToGridStyleFn from '../../../functions/tagToGridStyle.fn'
	import { showDynamicArtistsConfig, showExtensionsIconsConfig, songListTagConfig } from '../../../stores/config.store'
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
		Date_Day: 15,
		Date_Month: 6,
		Date_Year: 2018,
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

	$: {
		gridStyle = tagToGridStyleFn($songListTagConfig)
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
</script>

<song-list-preview>
	<grid-tags style="grid-auto-columns:{gridStyle};">
	<!-- <grid-tags> -->
		{#each $songListTagConfig as selectedTag, index (index)}
			<SongTag song={sampleSong} tag={selectedTag} />
		{/each}
	</grid-tags>

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

	grid-tags {
		/* align-items: center; */
		/* display: grid; */
		/* grid-template-columns: 1fr 1fr; */
		width: 100%;

		padding: 1rem;

		background-color: var(--color-fg-1);
		color: var(--color-bg-1);

		display: grid;
		grid-template-rows: auto;
		/* grid-auto-columns: minmax(min-content, max-content) auto minmax(min-content, max-content)minmax(min-content, max-content)minmax(min-content, max-content); */
		grid-auto-flow: column;
	}

	.toggleButton {
		display: flex;
		justify-content: center;
		width: fit-content;
		margin-top: 1rem;
	}

	.toggleButton button span {
		display: flex;
		align-items: center;
	}
</style>
