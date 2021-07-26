import { generateId } from '../functions/generateId.fn'

let deferredPromise: any = undefined

let tasksToSync = new Proxy([] as any[], {
	get(target, fn: 'push' | 'unshift' | 'length') {
		if (fn === 'push') {
			deferredPromise(target)
		}
		return target[fn]
	}
})

/*

  isDone is not working well
  force new image otherwise it gives back the pre compressed image


*/

export function getTasksToSync(previousTasks: any[]) {
	return new Promise((resolve) => {
		previousTasks.forEach((previousTask) => {
			if (previousTask.isDone === true) {
				tasksToSync = tasksToSync.filter((task) => task.id !== previousTask.id)
			}
		})

		deferredPromise = resolve
	})
}

export function addTaskToSync(task: any = {}) {
	task.id = generateId()
	task.isDone = false
	tasksToSync.push(task)
}
