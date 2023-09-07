export default function (waitTimer: number) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(null)
		}, waitTimer)
	})
}
