import Fuse from 'fuse.js'

const fuseOptions = {
	shouldSort: true,
	includeScore: true
}

import { songListStore } from '../stores/main.store'

export default function (elementToHook: HTMLElement, tagToSearch: string, userInput: string) {
	return new Promise((resolve, reject) => {
		if (userInput === '') {
			userInput = undefined
		}

		let songList = []

		songListStore.subscribe(_ => (songList = _))()

		let suggestions = filterDistinctObjectArray(songList, tagToSearch)

		let results = []

		if (userInput !== undefined) {
			const fuse = new Fuse(suggestions, fuseOptions)

			results = fuse.search(userInput).slice(0, 5)
		} else {
			results = suggestions.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).slice(0, 5)
		}

		let suggestionElement = elementToHook.querySelector('tag-suggestions')

		if (suggestionElement) {
			suggestionElement.innerHTML = ''
		} else {
			suggestionElement = document.createElement('tag-suggestions')
		}

		if (results.length > 0) {
			results.forEach((result, index) => {
				if (!(result?.item || result)) return

				let suggestionContainerElement = document.createElement('tag-suggestion')
				suggestionContainerElement.setAttribute('data-content', `${result.item || result}`)
				suggestionContainerElement.setAttribute('data-index', `${index}`)
				suggestionContainerElement.setAttribute('data-tag', `${tagToSearch}`)

				suggestionContainerElement.addEventListener('click', evt => {
					resolve(result.item || result)
				})

				suggestionContainerElement.addEventListener('click', evt => {
					resolve(result.item || result)
				})

				suggestionElement.appendChild(suggestionContainerElement)
			})

			elementToHook.appendChild(suggestionElement)
		}
	})
}

function filterDistinctObjectArray(array: any[], key: string) {
	return array.map(item => item[key]).filter((item, index, self) => self.indexOf(item) === index)
}
