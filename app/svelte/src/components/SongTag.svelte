<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import type { PartialSongType } from '../../../types/song.type'

	import parseDuration from '../functions/parseDuration.fn'

	import RatingTag from './tags/RatingTag.svelte'
	import ExtensionTag from './tags/ExtensionTag.svelte'
	import TitleTag from './tags/TitleTag.svelte'
	import PlayCountTag from './tags/PlayCountTag.svelte'
	import SizeTag from './tags/SizeTag.svelte'
	import BitRateTag from './tags/BitRateTag.svelte'
	import CommentTag from './tags/CommentTag.svelte'
	import GenericTag from './tags/GenericTag.svelte'
	import DateTag from './tags/DateTag.svelte'

	export let tag: { value: string }
	export let song: PartialSongType

	let dispatch = createEventDispatcher()
</script>

<song-tag>
	{#if tag.value === 'Title'}
		<TitleTag {song} />
	{:else if tag.value === 'Rating'}
		<RatingTag on:starChange={evt => dispatch('starChange', evt.detail)} {song} hook="song-list-svlt" />
	{:else if tag.value === 'Duration'}
		{parseDuration(song.Duration || 0)}
	{:else if tag.value === 'PlayCount'}
		<PlayCountTag {song} />
	{:else if tag.value === 'Extension'}
		<ExtensionTag extension={song.Extension} />
	{:else if tag.value === 'Size'}
		<SizeTag size={song.Size} />
	{:else if tag.value === 'BitRate'}
		<BitRateTag bitRate={song.BitRate} />
	{:else if tag.value === 'Comment'}
		<CommentTag comment={song.Comment} />
	{:else if tag.value === 'Date'}
		<DateTag {song} />
	{:else}
		<GenericTag tagValue={song[tag.value]} />
	{/if}
</song-tag>
