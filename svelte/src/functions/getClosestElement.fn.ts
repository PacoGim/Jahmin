export default function (element: HTMLElement, parentTagName: string): HTMLElement {
	return element.closest(parentTagName)
}
