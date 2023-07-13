export type DatabaseResponseType = {
	type: 'initDb' | 'create' | 'update' | 'delete'
	results: {
		workerCallId: string
		data: any
	}
}

export type DatabaseMessageType = {
	type: 'initDb' | 'create' | 'update' | 'delete'
	workerCallId: string
	data:
		| {
				queryData: {
					select: string[]
					andWhere?: { [key: string]: string }[]
					orWhere?: { [key: string]: string }[]
					group?: string[]
					order?: string[]
				}
		  }
		| any
}
