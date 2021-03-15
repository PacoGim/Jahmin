<script lang="ts">
	import TagEditEditor from '../components/TagEdit-Editor.svelte'
	import TagEditSeparator from '../components/TagEdit-Separator.svelte'

	import type { SongType } from '../types/song.type'
	import type { TagDetailType } from '../types/tagDetails.type'

	import { selectedAlbumId, selectedSongsStore } from '../store/final.store'

	import { getAlbumIPC } from '../service/ipc.service'

	let isSelectedSongsFirstAssign = true

	let songList: SongType[] = []

	let tagGroupDetail: TagDetailType = undefined

	let newTags: TagDetailType = {
		Album: undefined,
		AlbumArtist: undefined,
		Artist: undefined,
		Comment: undefined,
		Composer: undefined,
		Date_Year: undefined,
		Date_Month: undefined,
		Date_Day: undefined,
		Genre: undefined,
		Rating: undefined,
		Title: undefined,
		Track: undefined
	}

	$: {
		newTags
		cleanObject()
	}

	$: {
		$selectedAlbumId
		$selectedSongsStore

		if (isSelectedSongsFirstAssign === true) {
			isSelectedSongsFirstAssign = false
		} else {
			checkSongs()
		}
	}

	function cleanObject() {
		let tagsToUpdate = {}

		for (let tag in tagGroupDetail) {
			if (tagGroupDetail[tag] !== newTags[tag]) {
				tagsToUpdate[tag] = newTags[tag]
			}
		}

		// console.log(tagsToUpdate)
	}

	let previousSongList: SongType[] = undefined

	// Check either Selected Songs (if any selected) or Selected Album (if no songs selected). Then, calls group songs
	function checkSongs() {
		getAlbumIPC($selectedAlbumId).then((result) => {
			// console.log(result)
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
			Genre: undefined,
			Rating: undefined,
			Title: undefined,
			Track: undefined,
			Date_Year: undefined,
			Date_Month: undefined,
			Date_Day: undefined
		}

		// Goes through every song and checks every tag from tag group.
		for (let song of songList) {
			for (let tag in tagGroup) {
				// console.log(tagGroup[tag], song[tag], tagGroup[tag] !== song[tag])

				if (tagGroup[tag] === undefined) {
					tagGroup[tag] = song[tag]

					// If does not match previously set value.
				} else if (tagGroup[tag] !== song[tag]) {
					tagGroup[tag] = '(Multiple Values)'
				}
			}
		}

		// console.log(tagGroup)

		tagGroupDetail = Object.assign({}, tagGroup)
		newTags = Object.assign({}, tagGroupDetail)
	}
</script>

<tag-edit-svlt>
	<component-name>Tag Edit</component-name>

	<TagEditEditor tagName="Title" type="input" bind:value={newTags.Title} />
	<TagEditEditor tagName="Album" type="input" bind:value={newTags.Album} />
	<TagEditEditor tagName="Artist" type="textarea" bind:value={newTags.Artist} />
	<TagEditEditor tagName="Album Artist" type="textarea" bind:value={newTags.AlbumArtist} />
	<TagEditEditor tagName="Genre" type="input" bind:value={newTags.Genre} />
	<TagEditEditor tagName="Composer" type="input" bind:value={newTags.Composer} />
	<TagEditEditor tagName="Comment" type="textarea" bind:value={newTags.Comment} />

	<span>Date</span>
	<date-tag-editor>
		<input type="number" bind:value={newTags.Date_Year} placeholder="Year" />

		<select bind:value={newTags.Date_Month}>
			<option value="(Multiple Values)">Month</option>
			<option value={1}>Jan</option>
			<option value={2}>Feb</option>
			<option value={3}>Mar</option>
			<option value={4}>Apr</option>
			<option value={5}>May</option>
			<option value={6}>Jun</option>
			<option value={7}>Jul</option>
			<option value={8}>Aug</option>
			<option value={9}>Sep</option>
			<option value={10}>Oct</option>
			<option value={11}>Nov</option>
			<option value={12}>Dec</option>
		</select>

		<input type="number" bind:value={newTags.Date_Day} placeholder="Day" />
	</date-tag-editor>
</tag-edit-svlt>

<style>
	date-tag-editor {
		width: 100%;
		display: grid;
		grid-template-columns: 4fr 3fr 2fr;
		width: calc(100% - 2rem);
		margin: 0 auto;
	}
	date-tag-editor select{
		cursor: pointer;
	}

	date-tag-editor input,
	date-tag-editor select {
		width: 100%;

		text-align: center;
		color: #fff;

		outline: none;

		/* margin: 0.5rem 0; */

		font-family: SourceSans;
		font-variation-settings: 'wght' 450;

		background-color: rgba(255, 255, 255, 0.15);
		padding: 0.25rem 0.3rem;
		/* border-radius: 5px; */
		border: none;
		font-size: 0.9rem;
	}

	date-tag-editor input:first-of-type {
		border-radius: 5px 0 0 5px;
	}

	date-tag-editor input:last-of-type {
		border-radius: 0 5px 5px 0;
	}

	tag-edit-svlt {
		grid-area: tag-edit-svlt;

		display: flex;
		flex-direction: column;

		background-color: rgba(0, 0, 0, 0.25);
	}

	component-name {
		text-align: center;
		padding: 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 0.5rem;
		/* font-size: .9rem; */
	}
</style>
