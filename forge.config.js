const appIcon = './dist/icons/logo'

module.exports = {
	packagerConfig: {
		asar: false,
		icon: appIcon,
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
				loadingGif: './resources/forge_assets/jahmin_install_loading.gif',
				iconUrl: 'https://raw.githubusercontent.com/PacoGim/Jahmin/main/dist/icons/logo.ico',
				setupIcon: 'dist/icons/logo.ico'
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
