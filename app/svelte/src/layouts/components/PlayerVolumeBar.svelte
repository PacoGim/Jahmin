<script lang="ts">
	import cssVariablesService from '../../services/cssVariables.service'
	import { keyPressed } from '../../stores/main.store'
	import { mainAudioPlayer, altAudioPlayer } from '../../stores/player.store'

	let hasVolumeFromStorageLoaded: boolean = false

	let saveVolumeDebounce: NodeJS.Timeout = undefined

	$: if (hasVolumeFromStorageLoaded === false && $mainAudioPlayer !== undefined && $altAudioPlayer !== undefined) {
		hasVolumeFromStorageLoaded = true
		setTimeout(() => {
			loadVolumeFromLocalStorage()
		}, 250)
	}

	function loadVolumeFromLocalStorage() {
		let volumeLS = Number(localStorage.getItem('volume') || NaN)

		if (volumeLS === undefined || isNaN(volumeLS) || volumeLS > 1 || volumeLS < 0) {
			volumeLS = 0.25
			localStorage.setItem('volume', String(volumeLS))
		}

		setAudioElementVolume(volumeLS)
		updateVolumeBarVisual(volumeLS)
	}

	function onVolumeInput(evt: Event) {
		let volumeBarElement = evt.target as HTMLInputElement
		let volume = Number(volumeBarElement.value)

		setAudioElementVolume(volume)
		updateVolumeBarVisual(volume)

		clearTimeout(saveVolumeDebounce)

		saveVolumeDebounce = setTimeout(() => {
			localStorage.setItem('volume', String(volume))
		}, 1000)
	}

	function setAudioElementVolume(newVolume: number) {
		$mainAudioPlayer.volume = newVolume
		$altAudioPlayer.volume = newVolume
	}

	function updateVolumeBarVisual(newVolume: number) {
		let volumeThumbElement = document.querySelector('volume-bar volume-thumb') as HTMLInputElement

		if (volumeThumbElement === null) {
			return
		}

		volumeThumbElement.innerHTML = String(Math.round(newVolume * 100))

		let volumeBarWidth = document.querySelector('volume-bar').clientWidth

		if (volumeBarWidth === 0) {
			setTimeout(() => {
				updateVolumeBarVisual(newVolume)
			}, 250)
			return
		}

		let volumeThumbWidth = document.querySelector('volume-bar volume-thumb').clientWidth

		let minValue = Number(cssVariablesService.get('art-lightness-dark').replace('%', ''))

		let maxValue = Number(cssVariablesService.get('art-lightness-light').replace('%', ''))

		if (maxValue > 70) {
			maxValue = 70
		}

		const differenceValue = maxValue - minValue // 80
		const steps = differenceValue / 100 // 0.8

		/*
			step * current value + min

			Max 90%
			Min 10%

			90 - 10 = 80 -> 80 / 100 = 0.8

			100% Volume -> 90%
			0% Volume -> 10%
			1% Volume -> 10.9%
			2% Volume -> 11.8%
			5% Volume -> 14.5%
			50% Volume -> 55%
			90% Volume -> 91%
		*/

		cssVariablesService.set('volume-thumb-color-lightness', `${maxValue - steps * (newVolume * 100)}%`)
		cssVariablesService.set('volume-level', `${(volumeBarWidth - volumeThumbWidth) * newVolume}px`)
	}
</script>

<volume-bar>
	<input
		type="range"
		min="0"
		max="1"
		step={$keyPressed === 'Shift' ? '0.05' : '0.01'}
		on:input={evt => {
			onVolumeInput(evt)
		}}
	/>
	<background />
	<volume-thumb>0</volume-thumb>
</volume-bar>

<style>
	volume-bar {
		/* margin: 0 1rem; */
		display: grid;
		grid-template-columns: 100%;

		justify-content: center;
		align-items: center;
		height: 32px;
	}

	input {
		display: block;
		grid-row: 1;
		grid-column: 1;
		height: 100%;
		z-index: 1;
		opacity: 0;
		cursor: grab;
	}

	input:active {
		cursor: grabbing;
	}

	volume-thumb {
		grid-row: 1;
		grid-column: 1;
		transform: translateX(var(--volume-level)); /*  Volume Visual Control */
		display: flex;
		align-items: center;
		justify-content: center;

		font-size: calc(1rem - 2px);

		height: 32px;
		width: 32px;
		background-color: #fff;
		border-radius: 25px;
		/* mix-blend-mode: hard-light; */

		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		/* color: #767676; */

		color: hsl(var(--art-hue), var(--art-saturation), var(--volume-thumb-color-lightness));

		/* text-shadow: 0 0 1px rgba(0,0,0,0.9); */

		font-variation-settings: 'wght' 700;
	}

	background {
		grid-row: 1;
		grid-column: 1;
		top: 0;
		left: 0;
		height: 16px;
		background: linear-gradient(
			to right,
			hsl(var(--art-hue), var(--art-saturation), var(--art-lightness-light)),
			hsl(var(--art-hue), var(--art-saturation), var(--art-lightness-dark))
		);
		border-radius: 25px;
		box-shadow:
			inset 0 0 0 2px #fff,
			inset 0 0 5px 0 rgba(0, 0, 0, 0.2),
			0 0 10px 0 rgba(0, 0, 0, 0.2);
	}
</style>
