<script lang="ts">
</script>

<statusbar-svlt>
	<p>Status Bar</p>
</statusbar-svlt>

<style>
	statusbar-svlt {
		grid-area: statusbar-svlt;
		height: 24px;

		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);

		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		color: var(--high-color);
		background-color: var(--low-color);

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}
</style>
