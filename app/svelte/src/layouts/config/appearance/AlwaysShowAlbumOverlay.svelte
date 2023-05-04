<script lang="ts">
	import generateId from '../../../functions/generateId.fn'
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import { layoutToShow } from '../../../stores/main.store'
	import { alwaysShowAlbumOverlayConfig, config } from '../../../stores/config.store'
	import traduceFn from '../../../functions/traduce.fn'

	let id = generateId()

	function onOptionChange(evt) {
		updateConfigFn({
			userOptions: {
				alwaysShowAlbumOverlay: evt.target.checked
			}
		})

		// $layoutToShow = 'Library'
	}
</script>

<always-show-album-overlay-config>
	<label for={id}>{traduceFn('Alway show album overlay in Album Grid')}</label>
	<input type="checkbox" name={id} {id} on:change={onOptionChange} bind:checked={$config.userOptions.alwaysShowAlbumOverlay} />
	<fancy-checkbox class="smooth-colors" active={$alwaysShowAlbumOverlayConfig} />
</always-show-album-overlay-config>

<style>
	always-show-album-overlay-config {
		display: grid;
		align-content: center;
	}

	always-show-album-overlay-config label {
		grid-area: 1/1;

		cursor: pointer;
	}

	always-show-album-overlay-config input {
		cursor: pointer;
		margin-left: 0.25rem;
		opacity: 0;
		height: 1rem;
		width: 1rem;

		grid-area: 1/2;
	}

	fancy-checkbox {
		margin-left: 0.25rem;
		pointer-events: none;
		display: inline-block;
		background-color: var(--color-fg-1);
		height: 1rem;
		width: 1rem;

		border-radius: 100vmax;

		grid-area: 1/2;

		position: relative;
	}

	fancy-checkbox::after {
		content: '';

		position: absolute;
		border-radius: 100vmax;
		display: inline-block;
		background-color: var(--color-accent-2);
		height: 1rem;
		width: 1rem;

		transform: scale(0);

		transition: transform 250ms cubic-bezier(0.6, -0.28, 0.735, 0.045);
	}

	fancy-checkbox[active='true']::after {
		transform: scale(0.75);
	}
</style>
