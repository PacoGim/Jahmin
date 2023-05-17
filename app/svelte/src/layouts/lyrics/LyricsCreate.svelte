<script>

  import { playingSongStore } from "../../stores/main.store"

</script>
<lyrics-create>
  <button>Create Lyrics from Night Running</button>
  <button>Create Lyric for {$playingSongStore?.Title} {$playingSongStore?.Artist}</button>
</lyrics-create>

<style>
  lyrics-create{
    grid-area: lyrics-create;

    display: flex;
    flex-direction: column;

    justify-content: space-evenly;
    padding: .5rem;
  }
</style>