<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../functions/hashString.fn'
	import { addIntersectionObserver } from '../functions/intersectionObserver.fn'
	import { getCoverIPC } from '../service/ipc.service'
	import { albumCoverArtMapStore } from '../store/final.store'
	import type { CoverArtType } from '../types/coverArt.type'

	let coverType = undefined
	let coverSrc = undefined

	export let rootDir
	export let observe = false

	let albumCoverArtVersion = undefined

	// let coverArtObserver: IntersectionObserver

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
		if (observe) {
			addIntersectionObserver(rootDir).then((result:any) => {
				if (result.status === 'cover-not-found') {
					getAlbumCover()
				} else if (result.status === 'cover-found') {
					setCoverArtSource(result.data)
				}
			})

			// addIntersectionObserver()
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

	function getAlbumCover() {
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

<cover-art>
	{#if coverType === undefined}
		<img src="./img/audio.svg" class="loader" alt="" />
	{/if}
	{#if coverType === 'not found'}<img src="./img/compact-disc.svg" class="notFound" alt="" />{/if}
	{#if coverType === 'image'}<img src={coverSrc} alt="" />{/if}
	{#if coverType === 'video'}
		<video autoplay loop>
			<track kind="captions" />
			<source src={coverSrc} />
		</video>
	{/if}
</cover-art>

<style>
	cover-art {
		grid-column: 1;
		grid-row: 1;
		width: inherit;
		height: inherit;
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
