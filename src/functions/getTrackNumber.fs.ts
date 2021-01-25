export function getTrackNumber(doc: any, extension: string){
  let trackNumber = undefined



	if (extension === 'm4a') {
    console.log(doc)
		trackNumber = doc['native']['iTunes'].filter((i: any) => i['id'] === 'aART').map((i: any) => i['value']).join('\\\\')

		if (trackNumber) return trackNumber
	}

	return doc['common']['track']['no'] || undefined
}