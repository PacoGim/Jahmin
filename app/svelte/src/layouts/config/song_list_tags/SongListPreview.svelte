<script lang="ts">
	import SongTag from '../../../components/SongTag.svelte'
	import tagToGridStyleFn from '../../../functions/tagToGridStyle.fn'
	import ToggleOffIcon from '../../../icons/ToggleOffIcon.svelte'
	import ToggleOnIcon from '../../../icons/ToggleOnIcon.svelte'
	// import { songListTagsConfig } from '../../../store/config.store'
	import { config, songListTagsValuesStore } from '../../../stores/main.store'
	import type { PartialSongType } from '../../../../../types/song.type'

	let gridStyle = ''

	let sampleSong: PartialSongType = {
		Album: 'Post Traumatic',
		AlbumArtist: 'Mike Shinoda',
		Artist: 'Mike Shinoda',
		BitRate: 159.5405714285714,
		Comment: 'This is a comment',
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
		PlayCount: 10,
		DynamicArtists: '(feat. Mike Shinoda//Grandson)'
	}

	$: {
		gridStyle = tagToGridStyleFn($config.songListTags)
	}

	function toggleDynamicArtists() {
		let dynamicArtistsTagIndex = $config.songListTags.findIndex(tag => tag.value === 'DynamicArtists')
		let titleTagIndex = $config.songListTags.findIndex(tag => tag.value === 'Title')

		if (dynamicArtistsTagIndex === -1) {
			if (titleTagIndex === -1) {
				$config.songListTags.push({
					value: 'Title',
					isExpanded: false,
					align: 'center'
				})
			}

			$config.songListTags.push({
				value: 'DynamicArtists',
				isExpanded: false,
				align: 'center'
			})
		} else {
			$config.songListTags.splice(dynamicArtistsTagIndex, 1)
		}

		$config.songListTags = $config.songListTags
	}
</script>

<song-list-preview>
	<grid-tags style="grid-template-columns:{gridStyle};">
		{#each $config.songListTags as selectedTag, index (index)}
			{#if selectedTag.value === 'Title' && $songListTagsValuesStore.includes('DynamicArtists')}
				<SongTag
					tagName={selectedTag.value}
					tagValue={`${sampleSong.Title} ${sampleSong.DynamicArtists}` || ''}
					align={selectedTag?.align?.toLowerCase()}
				/>
			{:else if selectedTag.value !== 'DynamicArtists'}
				<SongTag
					tagName={selectedTag.value}
					tagValue={sampleSong[selectedTag.value] || ''}
					align={selectedTag?.align?.toLowerCase()}
				/>
			{/if}
		{/each}
	</grid-tags>
	<enable-dynamic-artists>
		<button on:click={toggleDynamicArtists}>
			{#if $songListTagsValuesStore.includes('DynamicArtists')}
				<span>Dynamic Artists <ToggleOnIcon style="height: 1.25rem;fill:#fff;margin-left: 0.5rem;" /> </span>
			{:else}
				<span>Dynamic Artists <ToggleOffIcon style="height: 1.25rem;fill:#fff;margin-left: 0.5rem;" /></span>
			{/if}
		</button>
	</enable-dynamic-artists>
</song-list-preview>

<style>
	song-list-preview {
		display: block;
		padding: 0 1rem;
	}

	grid-tags {
		align-items: center;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	enable-dynamic-artists {
		display: flex;
		justify-content: center;

		margin-top: 1rem;
	}

	enable-dynamic-artists button span {
		display: flex;
		align-items: center;
	}
</style>
