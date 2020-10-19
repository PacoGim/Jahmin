import { Writable, writable } from 'svelte/store'

export let songIndex: Writable<string[]> = writable([])

type FilterType = {
	userSelection?: string
	filter: string
	data?: any[]
}

export let allSongFilters: Writable<FilterType[]> = writable([])


export let userSelectedTagsToGroup: Writable<string[]> = writable(['Genre', 'AlbumArtist', 'Album'])

// Value choosen by the user to filter out the specified tag from the song index.
export let userSelectedValueToFilter: Writable<string[]> = writable(['Anime'])

/*
  [
    0:{
      filter:'Genre',
      userSelection:'Electronic',
      data:[]
    },
    1:[
      {

      },
      ...
    ],
    2:[
      {

      },
      ...
    ]
  ]

*/
