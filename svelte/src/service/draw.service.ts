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



	for (let i = 0; i < normalizedData.length; i++) {
		const x = width * i
		let y = normalizedData[i] * canvas.offsetHeight
		if (y < 0 || y > canvas.offsetHeight / 2) {
			y = 0
		}

		drawLineSegment(ctx, x, y, width, (i + 1) % 2)
	}
}

function drawLineSegment(ctx: CanvasRenderingContext2D, x: number, y: number, width, isEven) {
	ctx.strokeStyle = `#fff`
	ctx.lineWidth = 0.2
	ctx.beginPath()
	y = isEven ? y : -y
	ctx.moveTo(x, 0)
	ctx.lineTo(x, y)
	ctx.lineTo(x + width, y)
	ctx.lineTo(x + width, 0)
	ctx.stroke()
}
