<script lang="ts">
	import { onMount } from 'svelte'

	let isShowConfirmDownloadPrompt = false
	let isShowDownloadProgress = false

	let ffmpegDownloadStatus = {
		operation: 'Waiting',
		progress: 0
	}

	export function showConfirmDownloadPrompt() {
		isShowConfirmDownloadPrompt = true
	}

	function handleYesButtonClick() {
		isShowDownloadProgress = true
		isShowConfirmDownloadPrompt = false
		window.ipc.startFfmpegDownload()
	}

	onMount(() => {
		window.ipc.onFfmpegDownload((_, result) => {
			ffmpegDownloadStatus = result

			if (result.operation === 'Process done') {
				isShowDownloadProgress = false
			}
		})
	})
</script>

<download-ffmpeg-svlt class:hide={isShowConfirmDownloadPrompt === false && isShowDownloadProgress === false}>
	<confirm-download-prompt class="prompt" class:hide={isShowConfirmDownloadPrompt === false}>
		<prompt-title> Ffmpeg not found in your system </prompt-title>
		<prompt-body>
			<p>Would you like me to download it?</p>
			<p>It is required for the app to work properly</p>
		</prompt-body>
		<prompt-buttons>
			<button class="confirm" on:click={handleYesButtonClick}>Yes</button>
			<button class="cancel" on:click={() => (isShowConfirmDownloadPrompt = false)}>No</button>
		</prompt-buttons>
	</confirm-download-prompt>

	<progress-download-prompt class="prompt" class:hide={isShowDownloadProgress === false}>
		<prompt-title> Ffmpeg is soon downloading </prompt-title>
		<prompt-body>
			<download-info>
				<info-text> {ffmpegDownloadStatus.operation} </info-text>
				<info-percent-done> {ffmpegDownloadStatus.progress}% </info-percent-done>
			</download-info>
			<progress-bar>
				<progress-fill style="width: {ffmpegDownloadStatus.progress}%;" />
			</progress-bar>
		</prompt-body>
		<prompt-buttons>
			<button class="cancel">Cancel</button>
		</prompt-buttons></progress-download-prompt
	>
</download-ffmpeg-svlt>

<style>
	download-ffmpeg-svlt {
		z-index: 999;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--color-bg-1);
		color: var(--color-fg-2);
		box-shadow: 0px 0px 100px 0px #000;
		border-radius: 6px;
		padding: 2rem;
		text-align: center;
		font-size: 1.12rem;
		width: 50%;
		max-width: 700px;
		min-width: 500px;
	}

	.hide {
		display: none;
	}

	prompt-title {
		font-size: 1.5rem;
		margin-bottom: 2rem;
		font-variation-settings: 'wght' 600;
	}

	prompt-body {
		font-variation-settings: 'wght' 300;
		margin-bottom: 2rem;
		width: 100%;
	}

	prompt-buttons {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}

	prompt-buttons button {
		padding: 0.25rem 0.5rem;
		width: 25%;
	}

	prompt-buttons button.confirm {
		background-color: var(--color-accent-1);
	}

	prompt-buttons button.cancel {
		background-color: var(--color-accent-3);
	}

	progress-bar {
		display: flex;
		align-items: center;
		height: 12px;
		width: 66%;
		border-radius: 100vmax;
		margin: 0 auto;
		background-color: var(--color-accent-3);
	}

	progress-fill {
		margin: 0 2px;
		display: block;
		height: 8px;
		/* width: 50%; */
		border-radius: 100vmax;
		background-color: #fff;
	}

	download-info {
		position: relative;
		display: block;
		height: 1rem;
		width: 66%;
		margin: 0 auto;
		padding: 0.75rem;
		font-size: 0.9rem;
	}

	download-info info-text {
		position: absolute;
		left: 0;
		top: 0;
		margin-left: 0.5rem;
	}

	download-info info-percent-done {
		position: absolute;
		margin-right: 0.5rem;
		right: 0;
		top: 0;
	}
</style>
