export default function(elementId: string, intersectionRoot: string) {
	return new Promise((resolve, reject) => {
		let elementObserver: IntersectionObserver

		elementObserver = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting === true) {
					resolve(true)
					elementObserver.disconnect()
				}
			},
			{
				root: document.querySelector(intersectionRoot),
				threshold: 0,
				rootMargin: '200% 0px 200% 0px'
			}
		)

		elementObserver.observe(document.querySelector(`#${CSS.escape(elementId)}`))
	})
}
