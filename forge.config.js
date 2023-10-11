module.exports = {
	packagerConfig: {
		asar: false,
		icon: './dist/icons/logo',
		ignore: file => {
			// if (file.includes('resources')) {
			// 	return true
			// }
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
			config: {
				loadingGif: './resources/forge_assets/jahmin_install_loading.gif'
			}
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				productName: 'Jahmin',
				name: 'Jahmin'
			}
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {}
		}
	]
}
