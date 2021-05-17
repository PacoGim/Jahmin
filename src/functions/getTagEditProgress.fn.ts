import { getTagEditWorker } from '../services/worker.service'

let worker = getTagEditWorker()

let deferedPromise: any = undefined

worker.on('message', (progress) => {
	deferedPromise(progress)
})

export function getTagEditProgress() {
	return new Promise((resolve, reject) => {
		worker.postMessage({ message: 'GetProgress' })

		deferedPromise = resolve
	})
}
