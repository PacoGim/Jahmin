import tippy, { type Instance, type Props } from 'tippy.js'
import DomPurify from 'dompurify'

let tippyInstances = new Map<string, Instance<Props>[]>()

export const defaultTippyOptions = {
	theme: 'dynamic',
	animation: 'scale-subtle',
	inertia: true,
	allowHTML: true
}

export default function (id: string, query: string | Element, options: any) {
	let tippyInstance = tippyInstances.get(id)

	if (options?.content) {
		options.content = DomPurify.sanitize(options.content, { ALLOWED_TAGS: ['bold'] })
	}

	// If exists, update content.
	if (tippyInstance) {
		tippyInstance.forEach(instance => {
			instance.setContent(options.content)
		})
		// Otherwise, create new instance.
	} else {
		//@ts-ignore
		tippyInstances.set(id, tippy(query, Object.assign(defaultTippyOptions, options)))
	}
}

export function deleteInstance(id: string) {
	let tippyInstance = tippyInstances.get(id)

	// If exists, update content.
	if (tippyInstance) {
		//@ts-ignore
		tippyInstance.destroy()
		tippyInstances.delete(id)
	}
}
