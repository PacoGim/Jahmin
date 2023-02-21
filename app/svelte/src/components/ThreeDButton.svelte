<script>
	import { createEventDispatcher } from 'svelte/internal'

	const dispatcher = createEventDispatcher()
</script>

<button
  on:click={() => dispatcher('buttonClick', true)}
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

		background-color: var(--bg-color);

		font-variation-settings: inherit;

		box-shadow:
      inset 0 0 10px 2px rgba(0, 0, 0, 0.1),
      0 1px 0 var(--shadow-color),
      0 2px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color),
      0 4px 0 var(--shadow-color),
      0 5px 0 var(--shadow-color),
      0 6px 0 var(--shadow-color),
			0 7px 0 var(--shadow-color),
      0 8px 0 var(--shadow-color),
      0 9px 0 var(--shadow-color),
      0 10px 0 var(--shadow-color),
			0 10px 5px var(--shadow-dark-color);

		transition-property: box-shadow, transform;
		transition-timing-function: linear;
		transition-duration: 150ms;
	}

	button:hover {
		transform: translateY(2px);

		box-shadow:
      inset 0 0 10px 2px rgba(0, 0, 0, 0.1),
      0 1px 0 var(--shadow-color),
      0 2px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color),
      0 4px 0 var(--shadow-color),
      0 5px 0 var(--shadow-color),
      0 6px 0 var(--shadow-color),
			0 7px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
			0 7px 5px var(--shadow-dark-color);
	}

	button:active {
		transform: translateY(7px);

		box-shadow:
      inset 0 0 10px 2px rgba(0, 0, 0, 0.1),
      0 1px 0 var(--shadow-color),
      0 2px 0 var(--shadow-color),
			0 3px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
			0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
      0 0px 0 var(--shadow-color),
			0 3px 5px var(--shadow-dark-color);
	}
</style>
