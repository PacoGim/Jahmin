import { Writable, writable } from 'svelte/store'

export let songIndex:Writable<string[]> = writable([])

type FilterType={
  userSelection?:string
  data?:any[]
}

export let allSongFilters:Writable<FilterType[]>=writable([])




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