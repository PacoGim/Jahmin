const { ipcRenderer } = require('electron')

export function getOrder(index: number) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-order', index).then((result) => {
			resolve(result)
		})
	})
}

export function getConfig() {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-config').then((result) => {
			resolve(result)
		})
	})
}
