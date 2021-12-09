import tippy, { roundArrow, Instance, Props } from 'tippy.js'

let tippyInstances = new Map<string, Instance<Props>[]>()

const defaultOptions = {
	theme: 'dynamic',
	arrow: roundArrow,
	animation: 'scale-subtle',
	inertia: true,
	allowHTML: true
}

export default function (id: string, query: string, options: any) {
	let tippyInstance = tippyInstances.get(id)

	// If exists, update content.
	if (tippyInstance) {
		tippyInstance.forEach(instance => {
			instance.setContent(options.content)
		})
		// Otherwise, create new instance.
	} else {
		tippyInstances.set(id, tippy(query, Object.assign(defaultOptions, options)))
	}
}
