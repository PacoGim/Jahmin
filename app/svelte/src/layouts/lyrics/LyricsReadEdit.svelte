<script lang="ts">
	export let lyricsMode

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

<lyrics-read-edit>
	<textarea value={lyric} disabled={lyricsMode==='Read'?true:false} />
</lyrics-read-edit>

<style>
	lyrics-read-edit {
		grid-area: lyrics-read-edit;

		padding: 1rem;

		overflow-y: auto;
	}

	textarea {
		width: 100%;
		height: calc(100% - 5px);

		resize: vertical;

    background-color: var(--color-bg-2);
    color: currentColor;

    border: none;

    padding: 1rem;
	}

	textarea:disabled {
    background-color: var(--color-bg-2);
		color: currentColor;
	}
</style>
