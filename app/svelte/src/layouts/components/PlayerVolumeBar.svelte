<script lang="ts">
  import cssVariablesService from '../../services/cssVariables.service'
	import { keyPressed, mainAudioElement, altAudioElement } from '../../stores/main.store'

	let hasVolumeFromStorageLoaded: boolean = false

	let saveVolumeDebounce: NodeJS.Timeout = undefined

	$: if (hasVolumeFromStorageLoaded === false && $mainAudioElement !== undefined && $altAudioElement !== undefined) {
		hasVolumeFromStorageLoaded = true
		loadVolumeFromLocalStorage()
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
		$mainAudioElement.volume = newVolume
		$altAudioElement.volume = newVolume
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
		mix-blend-mode: hard-light;

		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		color: #767676;

		font-variation-settings: 'wght' 700;
	}

	background {
		grid-row: 1;
		grid-column: 1;
		top: 0;
		left: 0;
		height: 16px;
		background: linear-gradient(to right, var(--art-color-base), var(--art-color-dark));
		border-radius: 25px;
		box-shadow: inset 0 0 0 2px #fff, inset 0 0 5px 0 rgba(0, 0, 0, 0.2), 0 0 10px 0 rgba(0, 0, 0, 0.2);
	}
</style>
