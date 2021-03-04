<script lang="ts">
	import { getCoverIPC } from '../service/ipc.service'

	// import { selectedAlbum } from '../store/player.store'

	let coverSrc = undefined

	$: {
		// console.log($selectedAlbumId)
/*
		if ($selectedAlbumId?.['RootDir']) {
			getCoverIPC($selectedAlbumId['RootDir']).then((response) => {
				if (response['fileType'] === 'image') {
					// coverSrc = `url(${response['filePath']})`

					// console.log(coverSrc)
					// document.documentElement.style.setProperty('--song-list-background-image', coverSrc)
					let $el = document.querySelector('song-list-background-svlt')

					if ($el) {
						// console.log($el)
						// console.log($el.style.backgroundImage)
						$el.setAttribute('style', `background-image: url('${response['filePath']}');`)
					}
					// $el.backgroundImage = coverSrc

					// console.log()
					// console.log($el)
				}
			})
		}
		*/
	}
</script>

<song-list-background-svlt />

<style>
	song-list-background-svlt {
		grid-area: song-list-svlt;
		position: relative;
		width: 100%;
		height: 100%;
		pointer-events: none;

		/* background-image: url('/Users/fran/Library/Application Support/Jahmin/art/192/dn8dyp.webp'); */
		/* background-size: cover; */
		background-repeat: no-repeat;
		background-size: 100% 100%;
		z-index: -1;

		transition: background-image 300ms;
	}

	song-list-background-svlt::before {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.33);
		backdrop-filter: blur(100px);
		/* z-index: 1; */
	}

</style>
