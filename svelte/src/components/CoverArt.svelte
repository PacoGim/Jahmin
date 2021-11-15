<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../functions/hashString.fn'
	import { addIntersectionObserver } from '../functions/intersectionObserver.fn'
	import { getCoverIPC } from '../services/ipc.service'
	import { albumCoverArtMapStore } from '../store/final.store'
	import type { CoverArtType } from '../types/coverArt.type'

	let coverType = undefined
	let coverSrc = undefined

	export let klass
	export let rootDir
	export let type: 'forceLoad' | 'observe' | null = null
	export let showPlaceholder = true
	export let style

	let albumCoverArtVersion = undefined

	$: {
		forceCoverSource(rootDir)
	}

	$: {
		let albumId = hash(rootDir, 'text')
		const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId)
		if (ALBUM_COVER_ART_DATA?.version !== albumCoverArtVersion) {
			setCoverArtSource(ALBUM_COVER_ART_DATA)
		}
	}

	onMount(() => {
		if (type === 'observe') {
			addIntersectionObserver(rootDir).then((result: any) => {
				if (result.status === 'cover-not-found') {
					getAlbumCover(rootDir)
				} else if (result.status === 'cover-found') {
					setCoverArtSource(result.data)
				}
			})
		} else if (type === 'forceLoad') {
			getAlbumCover(rootDir)
		}
	})

	function forceCoverSource(rootDir: string) {
		let albumId = hash(rootDir, 'text')
		const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId)

		setCoverArtSource(ALBUM_COVER_ART_DATA)
	}

	function setCoverArtSource(coverData: CoverArtType) {
		if (coverData) {
			albumCoverArtVersion = coverData.version
			coverType = coverData.fileType
			coverSrc = `${coverData.filePath}#${coverData.version}`
		}
	}

	function getAlbumCover(rootDir: 'string') {
		getCoverIPC(rootDir).then((response: CoverArtType) => {
			let albumId = hash(rootDir, 'text')
			if (response) {
				$albumCoverArtMapStore.set(albumId, {
					version: 0,
					filePath: response.filePath,
					fileType: response.fileType
				})

				$albumCoverArtMapStore = $albumCoverArtMapStore
			} else {
				coverType = 'not found'
			}
		})
	}
</script>

<cover-art {style}>
	{#if coverType === undefined && showPlaceholder === true}
		<img src="./img/audio.svg" class="loader" alt="" />
	{/if}
	{#if coverType === 'not found' && showPlaceholder === true}<img src="./img/compact-disc.svg" class="notFound" alt="" />{/if}
	{#if coverType === 'image'}<img class={klass} src={coverSrc} alt="" />{/if}
	{#if coverType === 'video'}
		<video class={klass} autoplay loop>
			<track kind="captions" />
			<source src={coverSrc} />
		</video>
	{/if}
</cover-art>

<style>
	cover-art {
		cursor: default;
		grid-column: 1;
		grid-row: 1;
		display: block;
	}

	video {
		height: inherit;
		width: inherit;
	}

	img {
		height: inherit;
		width: inherit;
	}

	img.loader {
		padding: 5rem;
	}

	img.notFound {
		border-width: 10px;
		border-color: #fff #ccc #ccc #fff;
		border-style: solid;
		padding: 2rem;
	}
</style>
