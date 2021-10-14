export type PromptStateType = {
	title: string
	placeholder: string
	confirmButtonText: string
	cancelButtonText: string
	task: PromptTasks
	data: any
}

export enum PromptTasks {
	None = 'None',
	Rename = 'Rename',
	SaveAs = 'SaveAs'
}
