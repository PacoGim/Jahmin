import * as path from 'path'
import * as fs from 'fs'

import { h32 } from 'xxhashjs'

import stringHash from '../functions/hashString.fn'
import getAppDataPathFn from '../functions/getAppDataPath.fn'

const PEAKS_DIR = path.join(getAppDataPathFn(), 'peaks')

export function savePeaks(sourceFile: string, peaks: number[]) {
	if (!fs.existsSync(PEAKS_DIR)) {
		fs.mkdirSync(PEAKS_DIR)
	}

	let hash = getSourceFileHash(sourceFile)

	fs.writeFileSync(getPeakFilePath(sourceFile), `${hash}\n${JSON.stringify(peaks)}`, { encoding: 'utf-8' })
}

export function getPeaks(sourceFile: string): Promise<number[] | undefined> {
	return new Promise((resolve, reject) => {
		let peaksFilePath = getPeakFilePath(sourceFile)

		if (!fs.existsSync(peaksFilePath)) {
			return resolve(undefined)
		}

		let peaksFile = fs.readFileSync(peaksFilePath, 'utf-8')

		// let hash = getSourceFileHash(sourceFile)

		// let peaksFileHash = peaksFile.split('\n')[0]
		let peaks = peaksFile.split('\n')[1]

		resolve(JSON.parse(peaks))
	})
}

function getSourceFileHash(sourceFile: string) {
	return h32().update(fs.readFileSync(sourceFile)).digest().toString(36)
}

function getPeakFilePath(sourceFile: string) {
	return path.join(PEAKS_DIR, `${stringHash(sourceFile, 'number')}.txt`)
}
