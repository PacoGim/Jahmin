<script lang="ts">
	import { onMount } from 'svelte'
	import type { PartialSongType } from '../../../../types/song.type'
	import numberZeroPad from '../../functions/numberZeroPad'

	export let song: PartialSongType

	let thisElement: HTMLElement

	let dateTagOrder = ['year', 'month', 'day']

	function createDateElement(date) {
		let finalString = ''
		dateTagOrder.forEach((value, index) => {
			if (date[value] === null) {
				switch (value) {
					case 'year':
						finalString += '____'
						break
					case 'month':
					case 'day':
						finalString += '__'
						break
				}
			} else {
				switch (value) {
					case 'year':
						finalString += date[value]
						break
					case 'month':
					case 'day':
						finalString += numberZeroPad(date[value])
						break
				}
			}

			if (index !== dateTagOrder.length - 1) {
				finalString += '/'
			} else if (index === dateTagOrder.length - 1) {
				monospaceData(finalString, thisElement)
			}
		})
	}

	function monospaceData(value: string, element: HTMLElement) {
		for (let char of value) {
			if (char !== '/') {
				let newElement = document.createElement('char')
				newElement.innerHTML = char
				element.appendChild(newElement)
			} else if (char === '/') {
				element.innerHTML += char
			}
		}
	}

	onMount(() => {
		createDateElement({
			year: song.Date_Year,
			month: song.Date_Month,
			day: song.Date_Day
		})
	})
</script>

<date-tag bind:this={thisElement} />

<style>
	:global(date-tag char) {
		display: inline-block;
		width: 10px;
	}
</style>
