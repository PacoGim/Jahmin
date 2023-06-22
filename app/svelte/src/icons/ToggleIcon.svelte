<script lang="ts">
	export let toggle = 'off'
</script>

<toggle-icon {toggle}>
	<toggle-icon-background />

	<toggle-icon-thumb />
</toggle-icon>

<style>
	toggle-icon {
		display: flex;
		align-items: center;
		position: relative;
		width: 24px;
		height: 14px;
		margin-left: 0.25rem;
	}

	toggle-icon-background {
		position: absolute;
		display: block;
		height: 100%;
		width: 100%;
		border-radius: 100vmax;
		border: 2px solid #fff;

		transition-property: background-color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	toggle-icon-thumb {
		position: absolute;
		display: block;
		height: 6px;
		width: 6px;
		margin: 0 0 0 4px;
		border-radius: 100vmax;
		background-color: var(--color-accent-1);

		transition-property: transform, background-color;
		transition-duration: 150ms, 300ms;
		transition-timing-function: ease-in-out, linear;
	}

	toggle-icon[toggle='on'] toggle-icon-background {
		background-color: #fff;
	}

	toggle-icon[toggle='on'] toggle-icon-thumb {
		transform: translateX(10px);
	}

	toggle-icon[toggle='off'] toggle-icon-thumb {
		background-color: #fff;
	}

	enable-dynamic-artists button:hover toggle-icon[toggle='on'] toggle-icon-thumb {
		/* background-color: var(--color-accent-2); */
	}
</style>
