<script lang="ts">
	export let lyricsMode

	export let fontWeight
	export let fontSize
	export let textAlignment

	let lyric = `Totsuzen ni mō Upside Down
Sekai wa kawari dasu
Inori mo todokanai
Boku ga kawari dasu

Imi o motomete hashiri tsuzukete
Jibun ga dare ka wakaranaku naru
Naki-sōdakedo maketakunaikara

Oshiete
Yoru ni haseru kono yurameki to
Omoinomama ni tobimawatte
Motto jiyū ni kakete ikou yo
Hoshi o miagete sa

Isshōbun no Ups and Downs
Sekai wa ugokidasu
Itami wa tomaranai
Kakusei shite tobidase

Imi mo naku mata hashiri tsuzukete
Owari no mienai tabi o tsuzukeru
Kirameku yō ni sekai o mitaikara
You might also like
YOASOBI - アイドル (Idol) (Romanized)
Genius Romanizations
Night Running
Cage The Elephant
NIGHT RUNNING
シン サキウラ (Shin Sakiura)
Oshiete
Yoru ni haseru kono yurameki to
Omoinomama ni tobimawatte
Saigomade hashiri kittara
Bokura wa dō naru no?

Itsuka mata kono basho ni tatte
Nandodemo tachiagaru kitto
Saigomade mitodokete zutto
Jiyū ni iki tetai

Imi o motomete hashiri tsuzukete
Jibun ga dare ka wakaranaku naru
Nakisōdakedo maketakunai no

Oshiete
Yoru ni haseru kono yurameki to
Omoinomama ni tobimawatte
Saigomade hashiri kittara
Bokura wa dō naru no?

Itsuka mata kono basho ni tatte
Nandodemo tachiagaru kitto
Saigomade mitodokete zutto
Jiyū ni iki tetai
(Imi o motomete hashiri tsuzukete
Jibun ga dare ka wakaranaku naru

Imi mo naku mata hashiri tsuzukete
Owari no mienai tabi o tsuzukeru)`
</script>

<lyrics-read-edit class={lyricsMode === 'Read' ? 'read' : 'edit'}>
	<!-- <lyrics-mode-name> Edit Mode </lyrics-mode-name> -->

	<lyrics-text-area>
		<textarea
			style="text-align:{['left', 'center', 'right'][textAlignment]};font-size: {fontSize}px;line-height: {fontSize}px;font-variation-settings:'wght' {fontWeight};"
			value={lyric}
			disabled={lyricsMode === 'Read' ? true : false}
		/>
	</lyrics-text-area>
</lyrics-read-edit>

<style>
	lyrics-read-edit {
		display: flex;
		flex-direction: column;

		position: relative;

		grid-area: lyrics-read-edit;

		padding: 1rem;

		padding-top: 0;

		overflow-y: auto;
	}

	lyrics-text-area {
		width: 100%;
		height: 100%;

		position: relative;
	}

	textarea {
		width: 100%;
		height: 100%;

		resize: none;

		background-color: var(--color-bg-2);
		color: currentColor;

		border: 2px solid var(--color-accent-4);

		padding: 1rem;

		transition-property: border-color, font-size, line-height, font-variation-settings;
		transition-duration: 300ms, 100ms, 100ms, 100ms;
		transition-timing-function: linear;
	}

	textarea:disabled {
		border-color: var(--color-bg-3);
		background-color: var(--color-bg-2);
		color: currentColor;
	}
</style>
