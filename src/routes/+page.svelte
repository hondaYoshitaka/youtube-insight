<script>
	import YoutubeChannelStaticsPage from '../components/YoutubeChannelStaticsPage.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="h-full">
	<YoutubeChannelStaticsPage />
</section>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.white);
	}
</style>
