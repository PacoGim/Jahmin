export default function (element: HTMLElement, selector: string): HTMLElement {
	return element.closest(selector)
}
