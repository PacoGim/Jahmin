import { isDoneDrawing } from '../store/index.store'

export function drawWaveform(normalizedData) {
	const canvas: HTMLCanvasElement = document.querySelector('canvas')
	const dpr = window.devicePixelRatio || 1
	const padding = 0
	canvas.width = canvas.offsetWidth * dpr
	canvas.height = (canvas.offsetHeight + padding * 2) * dpr
	const ctx = canvas.getContext('2d')
	ctx.scale(dpr, dpr)
	ctx.translate(0, canvas.offsetHeight / 2 + padding)

	const width = canvas.offsetWidth / normalizedData.length

	processData(width, 0, normalizedData, canvas, ctx, window.getComputedStyle(document.body).getPropertyValue('--low-color'))
}

function processData(width, index, normalizedData, canvas, ctx, color) {
	if (index > normalizedData.length - 1) {
		isDoneDrawing.set(true)
		return
	}
	const x = width * index
	let y = normalizedData[index] * canvas.offsetHeight
	if (y < 0) {
		y = 0
	}

	drawLineSegment(ctx, x, y, width, (index + 1) % 2, color).then(() => {
		processData(width, ++index, normalizedData, canvas, ctx, color)
	})
}

function drawLineSegment(ctx: CanvasRenderingContext2D, x: number, y: number, width, isEven, color) {
	return new Promise((resolve, reject) => {
		ctx.strokeStyle = color
		ctx.lineWidth = 0.2
		ctx.beginPath()
		y = isEven ? y : -y
		ctx.moveTo(x, 0)
		ctx.lineTo(x, y)
		ctx.lineTo(x + width, y)
		ctx.lineTo(x + width, 0)
		ctx.stroke()
		resolve('')
	})
}
