<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../functions/hashString.fn'
	import { getCoverIPC } from '../service/ipc.service'
	import { albumCoverArtMapStore } from '../store/final.store'
	import type { CoverArtType } from '../types/coverArt.type'

	let coverType = undefined
	let coverSrc = undefined

	export let rootDir
	export let observe = false

	let albumCoverArtVersion = undefined

	let coverArtObserver: IntersectionObserver

	$: {
		console.log(rootDir)
	}

	$: {
		console.log('yes')

		let albumId = hash(rootDir, 'text')
		const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId)
		if (ALBUM_COVER_ART_DATA?.version !== albumCoverArtVersion) {
			setCoverData(ALBUM_COVER_ART_DATA)
		}
	}

	onMount(() => {
		if (observe) {
			addIntersectionObserver()
		}
	})

	function addIntersectionObserver() {
		let albumId = hash(rootDir, 'text')
		coverArtObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting === true) {
					const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId)

					if (ALBUM_COVER_ART_DATA) {
						setCoverData(ALBUM_COVER_ART_DATA)
					} else {
						getAlbumCover()
					}

					// "Closes" the Cover Art Observer to avoid unnecessary checks.
					coverArtObserver.disconnect()
				}
			},
			{ root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '0px 0px 50% 0px' }
		)

		coverArtObserver.observe(document.querySelector(`art-grid-svlt > #${CSS.escape(String(albumId))}`))
	}

	function setCoverData(coverData: CoverArtType) {
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
