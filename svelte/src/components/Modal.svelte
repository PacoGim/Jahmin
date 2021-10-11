<script lang="ts">
	export let title = ''
</script>

<modal-svelte>
	<modal-content>
		<modal-close>x</modal-close>
		<modal-title>{title}</modal-title>
		<modal-body>
			<slot name="body" />
		</modal-body>
		<modal-footer>
			<modal-cancel>Cancel</modal-cancel>
			<modal-confirm>Confirm</modal-confirm>
		</modal-footer>
	</modal-content>
</modal-svelte>

<style>
	modal-svelte {

    --modal-border-radius:4px;

		position: fixed;
		top: 0;
		left: 0;

		display: flex;

		justify-content: center;
		align-items: center;

		width: 100%;
		height: 100%;

		z-index: 20;

		color: #000;

		background-color: rgba(0, 0, 0, 0.5);
	}

	modal-content {
		background-color: #fff;
		width: 33%;
		height: max-content;
		display: block;

		border-radius: var(--modal-border-radius);
    border-top-right-radius: 8px; /* Prevents close button "overlap" */

		padding: 1rem;

		position: relative;
	}

	modal-content modal-close {

    display: flex;
    align-items: center;
    justify-content: center;

		top: 0;
		right: 0;
		position: absolute;
		font-variation-settings: 'wght' 500;

    border-top-right-radius: var(--modal-border-radius);

    font-size: 1.2rem;
    cursor: pointer;
    height: 2rem;
    width: 2rem;

    color: #fff;
    background-color: #000;
	}

	modal-content modal-title {
		font-size: 1.2rem;
	}

	modal-content modal-body {
		display: block;
	}

	modal-content modal-footer {
		display: block;
		margin-left: auto;
		width: max-content;
	}
</style>
