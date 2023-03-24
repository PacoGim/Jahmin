<script>
	import traduceFn from '../functions/traduce.fn'
</script>

<input-steps-info
	>{traduceFn('Hold')} <shift-button>⇧ {traduceFn('Shift')}</shift-button> {traduceFn('to be more accurate')}</input-steps-info
>

<style>
	input-steps-info {
		margin-top: 0.75rem;
		display: block;
		font-size: 0.8rem;
		text-align: center;
	}

	input-steps-info shift-button {
		padding: 0.2rem 0.3rem;
		padding-left: 0.2rem; /* Padding left added to compensate the arrow blank space around. */
		border: 1px solid var(--color-fg-1);
		border-radius: 3px;
		font-size: 0.75rem;
	}
</style>
