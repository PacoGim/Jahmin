<script lang="ts">
	export let bitRate

	function formatBitRate(value: number) {
		if (value >= 1000) {
			return (value / 1e3).toFixed(1) + ' mbps'
		} else {
			return Math.trunc(value) + ' kbps'
		}
	}
</script>

<bit-rate-tag>
	{formatBitRate(bitRate)}
</bit-rate-tag>

<style>
	bit-rate-tag {
		width: 5rem;

		display: flex;
		align-items: center;
		justify-content: center;

	}
</style>
