import typeOfFn from './typeOf.fn'

export default function (e: Event | EventTarget | HTMLElement): any {
	let element

	// Check if the input is an HTML element
	if (typeOfFn(e).indexOf('HTML') !== -1 && typeOfFn(e).indexOf('Element') !== -1) {
		element = e
	}
	// Check if the input is an Event
	else if (typeOfFn(e).indexOf('Event') !== -1) {
		let event = e as Event
		element = event.target
	}

	// Return the dataset of the element
	return element.dataset
}
