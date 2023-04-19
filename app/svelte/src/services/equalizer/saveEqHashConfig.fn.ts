export default function (eqHashToSave: string) {
	window.ipc.saveConfig({
		userOptions: {
			equalizerHash: eqHashToSave
		}
	})
}
