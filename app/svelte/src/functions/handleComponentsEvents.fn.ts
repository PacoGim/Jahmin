import type { ComponentEventType } from '../../../types/componentEvent.type'

export default function (events: ComponentEventType[] | any[]) {
	events.forEach((event: ComponentEventType, index) => {
		if (event === undefined) return

		let element = document.querySelector(event.query) as HTMLElement

		if (element !== null) {
			events[index] = undefined

			setTimeout(() => {
				if (event.trigger === 'click') {
					handleClickEvent(element)
				} else if (event.trigger === 'scroll') {
					hanldleScrollEvent(element, event.options)
				}
			}, 100)
		}
	})
}

function handleClickEvent(element: HTMLElement) {
	element.click()
}

function hanldleScrollEvent(
	element: HTMLElement,
	options: any = {
		behavior: 'instant',
		block: 'center'
	}
) {
	element.scrollIntoView({ behavior: options.behavior, block: options.block })
}
