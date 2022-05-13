<script lang="ts">
	import { onMount } from 'svelte'

	// import { db, getSongById } from '../db/db'
	import type { SongType } from '../types/song.type'

	export async function addSong(song: SongType) {
		try {
			// let dbSong = await getSongById(song.ID)
			let dbSong = undefined

			if (dbSong === undefined) {
				addSong(song)
			} else {
				// TODO: Update song
				// await db.update(song)
			}
		} catch (e) {
			console.log(`Failed to add ${song.Title}.`)
		}
	}
</script>
