<script lang="ts">
	import { playing } from '../store/player.store'
</script>

<foo>
  <span  class="1 {$playing ? 'active' : ''}" />
  <span class="2 {$playing ? 'active' : ''}" />
</foo>


<style>


foo{
display: block;
height: 64px;
width: 64px;
}


	/* span {
		background-color: #fff;
    clip-path: polygon(0 100%, 0 0, 100% 0, 100% 100%, 66% 100%, 66% 0, 33% 0, 33% 100%);

    transition: clip-path 300ms ease-in-out;
	}

	span.active {
		clip-path: polygon(0 100%, 0 0, 100% 50%, 100% 50%, 100% 50%, 0 100%, 0 100%, 0 100%);
	} */
</style>
