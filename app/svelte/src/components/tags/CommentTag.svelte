<script lang="ts">
	import limitCharactersFn from '../../functions/limitCharacters.fn'

	export let comment

	function formatComment(value) {
		return limitCharactersFn(value,50)
	}
</script>

<comment-tag>
	<!-- {formatComment(comment)} -->
	{comment}
</comment-tag>

<style>
	comment-tag {
		/* display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: 22px; */
	}
</style>
