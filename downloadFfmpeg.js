let exec = require('child_process').exec
const fs = require('fs')
const path = require('path')
const pathToFfmpeg = require('ffmpeg-static')

;(async function main() {
	let ffmpegPath = await installAndGetFfmpegPath()

	resetBinFolder()
	copyFfmpegBinaryToDistFolder(ffmpegPath)
})()

function resetBinFolder() {
	if (fs.existsSync('./dist/bin') === true) {
		fs.rmSync('./dist/bin', { recursive: true })
	}

	fs.mkdirSync('./dist/bin')
}

function copyFfmpegBinaryToDistFolder(ffmpegPath) {
	fs.copyFileSync(ffmpegPath, `./dist/bin/${path.basename(ffmpegPath)}`)
}

function installAndGetFfmpegPath() {
	return new Promise((resolve, reject) => {
		exec(`npm install ffmpeg-static`, (error, stdout, stderr) => {
			if (error) {
				console.log('Error:')
				console.log(error)
				console.log('---------')
			}

			if (stdout) {
				console.log('Stdout:')
				console.log(stdout)
				console.log('---------')
			}

			if (stderr) {
				console.log('Stderr:')
				console.log(stderr)
				console.log('---------')
			}

			resolve(pathToFfmpeg)
		})
	})
}
