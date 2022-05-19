<script lang="ts">
	import SongTag from '../../../components/SongTag.svelte'
	import tagToGridStyleFn from '../../../functions/tagToGridStyle.fn'
	import { songListTagsConfig } from '../../../store/config.store'
	import type { PartialSongType } from '../../../types/song.type'

	let gridStyle = ''

	let sampleSong: PartialSongType = {
		Album: 'Nightchild',
		AlbumArtist: 'Jokabi',
		Artist: 'Jokabi',
		BitRate: 172.5405714285714,
		Comment: 'This is a comment',
		Composer: 'Jokabi',
		Date_Day: 13,
		Date_Month: 12,
		Date_Year: 2019,
		DiscNumber: 1,
		Duration: 126,
		Extension: 'opus',
		Genre: 'Lo-fi',
		Rating: 4,
		SampleRate: 48000,
		Size: 2738235,
		Title: 'Forest',
		Track: 1,
		PlayCount: 10
	}

	$: {
		gridStyle = tagToGridStyleFn($songListTagsConfig)
	}
</script>

<song-list-preview>
	<grid-tags style="grid-template-columns:{gridStyle};">
		{#each $songListTagsConfig as selectedTag, index (index)}
			<SongTag data={sampleSong[selectedTag.value]} tagName={selectedTag.value} align={selectedTag?.align?.toLowerCase()} />
		{/each}
	</grid-tags>
</song-list-preview>

<style>
	song-list-preview {
		width: var(--clamp-width);
	}

	grid-tags {
		align-items: center;
		display: grid;
		width: 100%;
	}
</style>
