import os from 'os'

export default function () {
	let platform = os.platform()

	if (platform === 'darwin') {
		if (isDarwinM1()) {
			return 'darwin-m1'
		} else {
			return 'darwin-intel'
		}
	}

	if (platform === 'win32') {
		return 'win32'
	}
}

function isDarwinM1() {
	let cpuCore = os.cpus()
	let isM1 = cpuCore[0].model.includes('Apple')

	return isM1
}