<script lang="ts">
	import { os } from '../../stores/main.store'

	export let size

	function bytesToMB(bytes: number): string {
		if ($os === 'win32') {
			return parseFloat((bytes / (1024 * 1024)).toFixed(1)) + 'MiB'
		} else {
			return parseFloat((bytes / (1000 * 1000)).toFixed(1)) + 'MB'
		}
	}
</script>

<size-tag>
	{bytesToMB(size)}
</size-tag>
