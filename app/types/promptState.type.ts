export type PromptStateType = {
	title: string
	placeholder: string
	confirmButtonText: string
	cancelButtonText: string
	data: any
	validateFn: (input: any) => { isValid: boolean; errorMessage?: string }
}
