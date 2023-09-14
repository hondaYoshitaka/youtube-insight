<script>
	import YoutubeChannelStatics from '../components/YoutubeChannelStatics.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<YoutubeChannelStatics />
</section>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.white);
	}
</style>
