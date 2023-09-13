<script>
    import AppAPI from "$lib/infra/web/app/AppAPI";
    import {format, parseISO} from "date-fns";
    import Fa from 'svelte-fa/src/fa.svelte'
    import {faYoutube} from "@fortawesome/free-brands-svg-icons";
    // import { Line } from "svelte-chartjs";
    // import 'chart.js/auto';

    let handleName = ''
    let videoTypes = ['video', 'short']
    let limit = 15

    let channel = null
    let videos = []

    $: totalViewCount = videos.reduce((total, video) => (total + video.viewCount), 0);
    $: averageViewCount = videos.length > 0 ? Math.round(totalViewCount / videos.length) : 0;

    $: totalCommentCount = videos.reduce((total, video) => (total + video.commentCount), 0);
    $: averageCommentCount = videos.length > 0 ? Math.round(totalCommentCount / videos.length) : 0;

    $: totalLikeCount = videos.reduce((total, video) => (total + video.likeCount), 0);
    $: averageLikeCount = videos.length > 0 ? Math.round(totalLikeCount / videos.length) : 0;

    const appAPI = new AppAPI();

    const search = async () => {
        channel = await appAPI.fetchYoutubeChannelBy(handleName);
        videos = await appAPI.fetchYoutubeVideosBy(channel.playlistId, videoTypes, limit);
    }
</script>

<div>
    <!-- form-->
    <div class="mb-4">
        <div class="mb-4">
            <label for="handle-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">チャンネル</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Fa icon={faYoutube} class="inline text-red-600" />
                </div>
                <input type="text" id="handle-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={handleName} placeholder="@YouTubeJapan"/>
            </div>
        </div>
        <div class="mb-4">
            <label for="video-type" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">動画の種類</label>
            <div class="flex">
                <div class="flex items-center mr-4">
                    <input id="video-type" type="checkbox" value="video" bind:group={videoTypes}
                           class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="youtube-video" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Youtube
                        動画</label>
                </div>
                <div class="flex items-center mr-4">
                    <input id="video-type" type="checkbox" value="short" bind:group={videoTypes}
                           class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="youtube-short" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Youtube
                        ショート</label>
                </div>
            </div>
        </div>
        <div class="mb-4">
            <label for="limit" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">動画の取得件数 (直近50件の中から)</label>
            <input type="text" id="limit" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={limit} placeholder="15"/>
        </div>
        <div class="flex justify-center">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={search}>
                分析する
            </button>
        </div>
    </div>

    <hr class="my-3"/>

    <section class="flex flex-wrap">
        <article class="w-4/5">
            <ul class="divide-y divide-slate-100">
                {#each videos as video}
                    <div class="flex items-start space-x-6 px-2 py-4">
                        <img src={video.thumbnailUrl} alt={video.title} width="60" height="88"
                             class="flex-none rounded-md bg-slate-100"/>

                        <div class="min-w-0 relative flex-auto">
                            <h2 class="font-semibold text-slate-900 truncate pr-20">
                                {#if video.isShort}
                                    <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-pink-600 bg-pink-200 last:mr-0 mr-1">short</span>
                                {/if}
                                <a href={video.url}>{video.title}</a>
                            </h2>
                            <dl class="mt-2 flex flex-wrap text-sm leading-6 font-medium">
                                <div class="absolute top-0 right-0 flex items-center space-x-1">
                                    <dt class="text-sky-500">
                                        <span class="sr-only">Star rating</span>
                                        <svg width="16" height="20" fill="currentColor">
                                            <path d="M7.05 3.691c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.372 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L.98 9.483c-.784-.57-.381-1.81.587-1.81H5.03a1 1 0 00.95-.69L7.05 3.69z"/>
                                        </svg>
                                    </dt>
                                    <dd>{video.viewCount.toLocaleString()} 回視聴</dd>
                                </div>

                                <div>
                                    <dt class="sr-only">高く評価</dt>
                                    <dd class="px-1.5 ring-1 ring-slate-200 rounded">{video.likeCount.toLocaleString()}likes
                                    </dd>
                                </div>
                                <div class="ml-2">
                                    <dt class="sr-only">コメント</dt>
                                    <dd class="px-1.5 ring-1 ring-slate-200 rounded">{video.commentCount.toLocaleString()}
                                        comments
                                    </dd>
                                </div>
                                <div class="ml-2">
                                    <dt class="sr-only">動画尺</dt>
                                    <dd>{video.duration}</dd>
                                </div>
                                <div class="ml-2">
                                    <dt class="sr-only">投稿日時</dt>
                                    <dd>{video.publishedAt}</dd>
                                </div>

                                <div class="flex-none w-full mt-2 font-normal">
                                    <dt class="sr-only">タグ</dt>
                                    <dd class="text-slate-400">{video.tags?.map(tag => `#${tag}`).join(' ') ?? ''}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                {/each}
            </ul>
        </article>

        <aside class="w-1/5">
            <h2 class="text-lg font-bold">チャンネル {channel?.title ?? ''}</h2>
            <div>
                {#if channel}
                    <img src={channel?.thumbnailUrl}/>
                    <p>{format(parseISO(channel?.publishedAt), 'yyyy/MM/dd')} に登録</p>
                    <p>チャンネル登録者数 {channel?.subscriberCount.toLocaleString()} 人</p>
                    <p>{channel?.videoCount.toLocaleString()} 動画</p>
                    <p>{channel?.viewCount.toLocaleString()} 回視聴</p>
                {/if}
            </div>

            <h2 class="text-lg font-bold">直近 {videos.length} 投稿のトレンド</h2>
            <ul class="mb-4">
                <li>
                    合計: {totalViewCount.toLocaleString()} 回視聴 / 平均: {averageViewCount.toLocaleString()} 回視聴
                </li>
                <li>
                    合計: {totalLikeCount.toLocaleString()} likes / 平均: {averageLikeCount.toLocaleString()} likes
                </li>
                <li>
                    合計: {totalCommentCount.toLocaleString()} comments / 平均: {averageCommentCount.toLocaleString()} comments
                </li>
            </ul>
        </aside>
    </section>
</div>
