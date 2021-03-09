<script lang="ts">
	import type { SongType } from '../types/song.type'
	import type { TagDetailType } from '../types/tagDetails.type'

	import { selectedAlbumId, selectedSongsStore } from '../store/final.store'

	import { getAlbumIPC } from '../service/ipc.service'

	let isSelectedSongsFirstAssign = true

	let songList: SongType[] = []

	let tagGroupDetail: TagDetailType = undefined

	$: {
		$selectedAlbumId
		$selectedSongsStore

		if (isSelectedSongsFirstAssign === true) {
			isSelectedSongsFirstAssign = false
		} else {
			checkSongs()
		}
	}

	let previousSongList: SongType[] = undefined

	// Check either Selected Songs (if any selected) or Selected Album (if no songs selected). Then, calls group songs
	function checkSongs() {
		getAlbumIPC($selectedAlbumId).then((result) => {
			// If songs selected
			if ($selectedSongsStore.length > 0) {
				songList = result.Songs.filter((song) => $selectedSongsStore.includes(song.ID))

				// Check if song list changed.
				if (JSON.stringify(previousSongList) !== JSON.stringify(songList)) {
					groupSongs()
					previousSongList = [...songList]
				}
			} else {
				songList = result.Songs

				// Check if song list changed.
				if (JSON.stringify(previousSongList) !== JSON.stringify(songList)) {
					groupSongs()
					previousSongList = [...songList]
				}
			}
		})
	}

	function groupSongs() {
		let tagGroup: TagDetailType = {
			Album: undefined,
			AlbumArtist: undefined,
			Artist: undefined,
			Comment: undefined,
			Composer: undefined,
			Date: undefined,
			Genre: undefined,
			Rating: undefined,
			Title: undefined,
			Track: undefined,
			Year: undefined
		}

		// Goes through every song and checks every tag from tag group.
		for (let song of songList) {
			for (let tag in tagGroup) {
				if (tagGroup[tag] === undefined) {
					tagGroup[tag] = song[tag]

					// If does not match previously set value.
				} else if (tagGroup[tag] !== song[tag]) {
					tagGroup[tag] = '(Multiple Values)'
				}
			}
		}

		tagGroupDetail = tagGroup
	}
</script>

<tag-edit-svlt>
	<component-name>Tag Edit</component-name>

	<tag-edit>
		<tag-name>Title</tag-name>
		<input type="text" value={tagGroupDetail?.Title} />
	</tag-edit>

	<tag-edit>
		<tag-name>Album</tag-name>
		<input type="text" value={tagGroupDetail?.Album} />
	</tag-edit>

	<tag-edit>
		<tag-name>Artist</tag-name>
		<input type="" value={tagGroupDetail?.Artist} />
		<!-- <textarea value={tagGroupDetail?.Artist}></textarea> -->
	</tag-edit>

	<tag-edit>
		<tag-name>Album Artist</tag-name>
		<input type="text" value={tagGroupDetail?.AlbumArtist} />
	</tag-edit>

	<tag-edit>
		<tag-name>Genre</tag-name>
		<input type="text" value={tagGroupDetail?.Genre} />
	</tag-edit>

	<tag-edit>
		<tag-name>Composer</tag-name>
		<input type="text" value={tagGroupDetail?.Composer} />
	</tag-edit>

	<tag-edit>
		<tag-name>Comment</tag-name>
		<input type="text" value={tagGroupDetail?.Comment} />
	</tag-edit>
</tag-edit-svlt>

<style>
	tag-edit-svlt {
		grid-area: tag-edit-svlt;

		display: flex;
		flex-direction: column;

		background-color: rgba(0, 0, 0, 0.25);
	}

	tag-edit {
		display: flex;
		align-items: center;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	tag-edit input,
	tag-edit textarea {
		text-align: center;
		width: calc(100% - 2rem);
		color: #fff;

		outline: none;

		margin: 1rem 0;

		background-color: rgba(255, 255, 255, 0.15);
		padding: 0.5rem;
		border-radius: 5px;
		border: none;
		font-family: Golos;
		font-size: 0.9rem;
	}

	tag-edit textarea{
		resize: vertical;
	}

	tag-edit input::placeholder {
		color: #aaa;
	}
	tag-edit::after {
		content: '';
		display: block;
		background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0) 100%);
		height: 3px;
		width: calc(100% - 2rem);
		/* margin: .5rem 0; */
	}

	component-name {
	}
</style>
