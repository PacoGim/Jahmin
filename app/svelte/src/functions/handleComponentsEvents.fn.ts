import { get } from 'svelte/store'
import type { ComponentEventType } from '../../../types/componentEvent.type'
import { groupByConfig } from '../stores/config.store'

export default function (events: ComponentEventType[] | any[], from: string) {
	// console.log('-------------')
	// console.log('-------------')
	// console.log('-------------')
	// console.log(from + ' ' + Math.random() * 100 + ' ', JSON.stringify(events))
	// console.log('-------------')
	// console.log('-------------')
	// console.log('-------------')

	switch (from) {
		case 'ArtGrid':
			handleArtGridEvents(events)
			break
		case 'TagGroup':
			handleTagGroupEvents(events)
			break
		default:
			break
	}
}

function handleTagGroupEvents(events) {
	events.forEach((event, index) => {
		if (event.trigger === 'scroll') {
			let groupElement: HTMLElement = document.querySelector(`#group-${CSS.escape(event.data.playingSong[get(groupByConfig)])}`)

			if (groupElement !== null) {
				events.splice(index, 1)
				groupElement.scrollIntoView({ block: 'nearest', behavior: 'instant' })
			}
		} else if (event.trigger === 'click') {
			let groupElement: HTMLElement = document.querySelector(`#group-${CSS.escape(event.data.playingSong[get(groupByConfig)])}`)

			if (groupElement !== null) {


        events.splice(index, 1)
				groupElement.click()
			}
		}
	})

  console.log('-------')
  console.log('-------')
  console.log(JSON.stringify(events))
  console.log('-------')
  console.log('-------')
}

function handleArtGridEvents(events) {
	// Loop through the art grid events array
	events.forEach((event, index) => {
		// Check if the event trigger is scroll
		if (event.trigger === 'scroll') {
			// Find the album element that matches the root directory of the event data
			let albumElement = document.querySelector(`[rootDir="${event.data.rootDir}"]`)

			// If the album element exists
			if (albumElement !== null) {
				// Remove the event from the array
				events.splice(index, 1)
				// Scroll the album element into view
				albumElement.scrollIntoView({ block: 'center', behavior: 'instant' })
			}
		}
	})
}
