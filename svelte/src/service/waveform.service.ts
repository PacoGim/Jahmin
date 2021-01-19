export function getWaveformData(arrayBuffer: ArrayBuffer) {
	return new Promise(async (resolve, reject) => {
		let ctx = new window.AudioContext()
		let audioBuffer = await ctx.decodeAudioData(arrayBuffer)
		let filteredData = filterData(audioBuffer)
		let normalizedData = normalizeData(filteredData)
		resolve(normalizedData)
	})
}

function filterData(audioBuffer) {
	const rawData = audioBuffer.getChannelData(0)
	// console.log(rawData)
	const samples = 65535/10
	// const samples = 500
	const blockSize = Math.floor(rawData.length / samples)

	const filteredData = []

	for (let i = 0; i < samples; i++) {
		let blockStart = blockSize * i
		let sum = 0
		for (let j = 0; j < blockSize; j++) {
			sum = sum + Math.abs(rawData[blockStart + j])
		}

		if (isNaN(sum)) sum = 0

		filteredData.push(sum / blockSize)
	}

	return filteredData
}

function normalizeData(filteredData: number[]) {
	const multiplier = Math.pow(Math.max(...filteredData), -1)
	return filteredData.map((n) => n * multiplier)
}
