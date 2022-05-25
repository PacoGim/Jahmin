import Fuse from 'fuse.js'

const fuseOptions = {
	shouldSort: true
}

import { playbackStore } from '../store/final.store'

export default function (elementToHook: HTMLElement, tagToSearch: string, userInput: string) {
	// console.log(elementToHook, tagToSearch, userInput)

	let playbackList = []

	playbackStore.subscribe(_ => (playbackList = _))()

	let suggestions = filterDistinctObjectArray(playbackList, tagToSearch)

	const fuse = new Fuse(suggestions, fuseOptions)

	const results = fuse.search(userInput).slice(0, 4)

	let suggestionElement = elementToHook.querySelector('tag-suggestions')

	if (suggestionElement) {
		suggestionElement.innerHTML = ''
	} else {
		suggestionElement = document.createElement('tag-suggestions')
	}

	if (results.length > 0) {
		results.forEach((result, index) => {
			let suggestionContainerElement = document.createElement('tag-suggestion')
			suggestionContainerElement.setAttribute('data-content', `${result.item}`)
			suggestionContainerElement.setAttribute('data-index', `${index}`)
			suggestionElement.appendChild(suggestionContainerElement)
		})

		elementToHook.appendChild(suggestionElement)
	}
}

function filterDistinctObjectArray(array: any[], key: string) {
	return array.map(item => item[key]).filter((item, index, self) => self.indexOf(item) === index)
}
