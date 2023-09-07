module.exports = {
	packagerConfig: {
		asar: false,
		icon: './dist/icons/logo',
		ignore: file => {
			if (file.includes('dist/binaries/win32/ffmpeg.exe')) {
				return true
			}
			if (file.includes('.git')) {
				return true
			}
			return false
		}
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-dmg',
			config: {
				format: 'ULFO'
			}
		},
		{
			name: '@electron-forge/maker-squirrel',
			config: {}
		},
		{
			name: '@electron-forge/maker-deb',
			config: {}
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {}
		}
	]
}
