<script lang="ts">
	import { onMount } from 'svelte'
	import type { PartialSongType } from '../../../../types/song.type'
	import numberZeroPad from '../../functions/numberZeroPad'
	import { dateOrderConfig } from '../../stores/config.store'

	export let song: PartialSongType

	let thisElement: HTMLElement

	$: if (thisElement && song) createDateElement($dateOrderConfig)

	function createDateElement(dateTagOrder) {
		let date = {
			year: song.Date_Year,
			month: song.Date_Month,
			day: song.Date_Day
		}

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

			if (value !== '') {
				finalString += '/'
			}

			if (dateTagOrder.length - 1 === index) {
				finalString = finalString.substring(finalString.length - 1, 0)
			}
		})
		monospaceData(finalString, thisElement)
	}

	function monospaceData(value: string, element: HTMLElement) {
		element.innerHTML = ''
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
		createDateElement($dateOrderConfig)
	})
</script>

<date-tag bind:this={thisElement} />

<style>
	:global(date-tag char) {
		display: inline-block;
		width: 10px;
	}
</style>
