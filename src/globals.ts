let albumArray: object[] = []

// External resolve. When resolve result set, the promise will be resolved.
let resolvePromise: any = null

export function setAlbumArray(newAlbumArray: any[]) {
	// Saves the new album array for future use.
  albumArray = newAlbumArray

  //TODO Filtering and stuff

  // Sets the external promise resolve result.
	resolvePromise(newAlbumArray)
}

export function getAlbumArray() {
	return albumArray
}

// Retuns a new Promise so it can be called anywhere in the app and will be resolved whenever the Promise external resolve is completed.
export function getNewPromiseAlbumArray() {
	return new Promise((resolve) => (resolvePromise = resolve))
}
