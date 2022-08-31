export type InputRangeStateType = {
	title: string
	min: number
	max: number
	step: number
	minStep: number
	value: number
	cancelButtonText: string
	confirmButtonText: string
	onChange: (value: number) => void
	onConfirm: (data: any) => void
	onCancel: (data: any) => void
}
