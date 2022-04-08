<script lang="ts">
	import { db } from '../db/db'
	import type { SongType } from '../types/song.type'

	export async function addSong(song: SongType) {
		try {
			const id = await db.songs.add(song)
		} catch (e) {
			console.log(`Failed to add ${song.Title}.`)
		}
	}
</script>
