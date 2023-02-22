<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte/internal'
	import toHSLObjectFn from '../functions/toHSLObject.fn'

	const dispatcher = createEventDispatcher()

	export let paddingX = '.3rem'
	export let paddingY = '.15rem'
	export let fontSize = '0.95rem'
	export let fontWeight = '600'
	export let { addShadow } = { addShadow: true } || { addShadow: false }
	export let colorName: 'reactBlue' | 'dangerRed' = 'reactBlue'
	export let disabled = false

	const colors = {
		reactBlue: 'hsl(193, 95%, 60%)',
		dangerRed: 'hsl(10, 95%, 58%)'
	}

	let baseColor = colors[colorName]
	let shadowColor = ''
	let shadowDarkColor = ''

	onMount(() => {
		if (addShadow) {
			let hslColorObject = toHSLObjectFn(colors[colorName])

			if (hslColorObject?.lightness) {
				shadowColor = `hsl(${hslColorObject.hue}, ${hslColorObject.saturation}%, ${hslColorObject.lightness - 20}%)`
				shadowDarkColor = `hsl(${hslColorObject.hue}, ${hslColorObject.saturation}%, ${hslColorObject.lightness - 30}%)`
			}
		}
	})
</script>

<button
	on:click={() => dispatcher('buttonClick', true)}
	style="
	--padding-x: {paddingX};
	--padding-y: {paddingY};
	--font-size: {fontSize};
	--base-color:{baseColor};
	--shadow-color:{shadowColor};
	--shadow-dark-color:{shadowDarkColor};
	--font-weight:{fontWeight};
	"
	data-disable-movement={addShadow ? 'false' : 'true'}
>
	<slot />
</button>

<style>
	button {
		font-variation-settings: 'wght' var(--font-weight) !important;
		font-size: var(--font-size);
		padding: var(--padding-y) var(--padding-x);
		line-height: normal;

		border-radius: 5px;

		background-color: var(--base-color);

		font-variation-settings: inherit;

		box-shadow: inset 0 0 10px 2px rgba(0, 0, 0, 0.1), 0 1px 0 var(--shadow-color), 0 2px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color), 0 4px 0 var(--shadow-color), 0 5px 0 var(--shadow-color), 0 6px 0 var(--shadow-color),
			0 7px 0 var(--shadow-color), 0 8px 0 var(--shadow-color), 0 9px 0 var(--shadow-color), 0 10px 0 var(--shadow-color),
			0 10px 5px var(--shadow-dark-color);

		transition-property: box-shadow, transform;
		transition-timing-function: linear;
		transition-duration: 150ms;
	}

	button[data-disable-movement='false']:hover {
		transform: translateY(3px);

		box-shadow: inset 0 0 10px 2px rgba(0, 0, 0, 0.1), 0 1px 0 var(--shadow-color), 0 2px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color), 0 4px 0 var(--shadow-color), 0 5px 0 var(--shadow-color), 0 7px 0 var(--shadow-color),
			0 7px 0 var(--shadow-color), 0 7px 0 var(--shadow-color), 0 7px 0 var(--shadow-color), 0 7px 0 var(--shadow-color),
			0 7px 5px var(--shadow-dark-color);
	}

	button[data-disable-movement='false']:active {
		transform: translateY(7px);

		box-shadow: inset 0 0 10px 2px rgba(0, 0, 0, 0.1), 0 1px 0 var(--shadow-color), 0 2px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color), 0 3px 0 var(--shadow-color), 0 3px 0 var(--shadow-color), 0 3px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color), 0 3px 0 var(--shadow-color), 0 3px 0 var(--shadow-color), 0 3px 0 var(--shadow-color),
			0 3px 5px var(--shadow-dark-color);
	}
</style>
