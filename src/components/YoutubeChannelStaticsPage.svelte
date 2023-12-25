<script>
    import AppAPI from '$lib/infra/web/app/AppAPI';
    import {format, parseISO} from 'date-fns';
    import Fa from 'svelte-fa/src/fa.svelte';
    import {faYoutube} from '@fortawesome/free-brands-svg-icons';
    import Durations from '$lib/util/Durations';
    import BarChart from "./ui/LineChart.svelte";
    import {HTTPError} from "ky";

    let handleName = '';
    let videoTypes = ['video', 'short'];
    let limit = 15;

    let channel = null;
    let videos = [];

    let isSearchFormVisible = false;

    let isNoResultVisible = false;
    let searchedHandleName = null;

    $: totalViewCount = videos.reduce((total, video) => total + video.viewCount, 0);
    $: averageViewCount = videos.length > 0 ? totalViewCount / videos.length : 0;

    $: totalCommentCount = videos.reduce((total, video) => total + video.commentCount, 0);
    $: averageCommentCount = videos.length > 0 ? totalCommentCount / videos.length : 0;

    $: totalLikeCount = videos.reduce((total, video) => total + video.likeCount, 0);
    $: averageLikeCount = videos.length > 0 ? totalLikeCount / videos.length : 0;

    $: totalEngagementCount = totalLikeCount + totalCommentCount;
    $: averageEngagementCount = videos.length > 0 ? totalEngagementCount / videos.length : 0;
    $: averageEngagementRate = totalViewCount > 0 ? totalEngagementCount / totalViewCount : 0;

    const appAPI = new AppAPI();

    const search = async () => {
        isSearchFormVisible = false;

        isNoResultVisible = false;
        searchedHandleName = handleName;

        channel = null;
        videos = [];

        try {
            channel = await appAPI.fetchYoutubeChannelBy(handleName);
        } catch (error) {
            if (error instanceof HTTPError && error.response.status === 404) {
                isNoResultVisible = true;
                return;
            }
            throw error;
        }
        videos = await appAPI.fetchYoutubeVideosBy(channel.playlistId, videoTypes, limit);
    };

    $: disabled = handleName.length === 0

    $: viewCountChartData = {
        labels: videos.map((video, index) => `#${index + 1}`),
        datasets: [
            {
                label: '視聴回数',
                data: videos.map(video => video?.viewCount),
                borderWidth: 2,
            },
        ],
    }
    $: likeCountChartData = {
        labels: videos.map((video, index) => `#${index + 1}`),
        datasets: [
            {
                label: 'Likes',
                data: videos.map(video => video?.likeCount),
                borderWidth: 2,
            },
        ],
    }
    $: commentCountChartData = {
        labels: videos.map((video, index) => `#${index + 1}`),
        datasets: [
            {
                label: 'Comments',
                data: videos.map(video => video?.commentCount),
                borderWidth: 2,
            },
        ],
    }
    $: engagementCount = {
        labels: videos.map((video, index) => `#${index + 1}`),
        datasets: [
            {
                label: 'エンゲージメント (%)',
                data: videos.map(video => (Math.round(video?.likeCount + video?.commentCount) / video?.viewCount * 10_000) / 100),
                borderWidth: 2,
            },
        ],
    }

</script>

<div class="flex flex-col h-full">
    <!-- form-->
    <div class="flex flex-col items-center pt-2">
        <div class="w-2/5">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Fa icon={faYoutube} class="inline text-red-600"/>
                </div>

                <input type="text"
                       id="handle-name"
                       class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full block pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       bind:value={handleName}
                       placeholder="チャンネル名、動画の種類を分析"
                       on:focus={() => isSearchFormVisible = true}
                />
                <button class="absolute top-0 right-0 py-2.5 px-4 h-full text-sm font-medium text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        class:opacity-50={disabled}
                        disabled={disabled}
                        on:click={search}
                >
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </button>
            </div>
        </div>

        {#if isSearchFormVisible}
            <div class="relative w-2/5 z-10">
                <div class="absolute px-2 py-3 shadow-md w-full bg-white rounded-b">
                    <div>
                        <label for="video-type"
                               class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            動画の種類
                        </label>
                        <div class="flex">
                            <div class="flex items-center mr-4">
                                <input id="youtube-video"
                                       type="checkbox"
                                       value="video"
                                       bind:group={videoTypes}
                                       class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label for="youtube-video"
                                       class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Youtube 動画
                                </label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input id="youtube-short"
                                       type="checkbox"
                                       value="short"
                                       bind:group={videoTypes}
                                       class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label for="youtube-short"
                                       class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Youtube ショート
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <label for="limit" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            動画の取得件数 (直近50件の中から)
                        </label>
                        <input id="limit"
                               type="text"
                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               bind:value={limit}
                               placeholder="15"
                        />
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <hr class="mt-3"/>

    <section class="flex flex-wrap w-full h-full relative grow">
        <article class="w-full">
            {#if isNoResultVisible}
                <div class="flex justify-center items-center h-64 bg-gray-100 text-gray-800">
                    <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 4a6 6 0 100 12 6 6 0 000-12zm0 2a4 4 0 100 8 4 4 0 000-8zM16.293 14.707a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414z" />
                        </svg>
                        <h3 class="mt-2 text-lg font-medium">{searchedHandleName} は存在しません</h3>
                    </div>
                </div>
            {/if}

            {#if channel}
                <div class="w-full bg-neutral-50 px-6 py-3">
                    <div class="flex flex-row pt-2">
                        <figure class="w-32">
                            <img src={channel?.thumbnailUrl} alt="channel thumbnail"/>
                        </figure>

                        <div class="w-auto">
                            <h2 class="text-2xl font-bold">{channel?.title ?? ''}</h2>
                            <div class="text-gray-600 text-sm">
                                <p>チャンネル登録者数 {channel?.subscriberCount.toLocaleString()} 人</p>
                                <p>
                                    <span>{channel?.videoCount.toLocaleString()} 動画</span>・
                                    <span>{channel?.viewCount.toLocaleString()} 回視聴</span>
                                </p>
                                <p>{format(parseISO(channel?.publishedAt), 'yyyy/MM/dd')} に登録</p>
                            </div>
                        </div>
                    </div>

                    <div class="pt-2">
                        <h2 class="font-bold text-gray-600">直近 {videos.length} 投稿のトレンド</h2>

                        <ul class="flex flex-row mb-4 text-sm text-gray-600 pt-2">
                            <li class="w-40">
                                <p class="mb-1">視聴回数</p>
                                {totalViewCount.toLocaleString()}
                            </li>
                            <li class="w-40 border-l-[1px] border-gray-300 ml-4 pl-4">
                                <p class="mb-1">Likes</p>
                                {totalLikeCount.toLocaleString()}
                            </li>
                            <li class="w-40 border-l-[1px] border-gray-300 ml-4 pl-4">
                                <p class="mb-1">Comments</p>
                                {totalCommentCount.toLocaleString()}
                            </li>
                            <li class="w-40 border-l-[1px] border-gray-300 ml-4 pl-4">
                                <p class="mb-1">エンゲージメント</p>
                                {totalEngagementCount.toLocaleString()} ({Math.round(averageEngagementRate * 10_000) / 100}%)
                            </li>
                        </ul>
                    </div>
                </div>
            {/if}

            {#if videos.length > 0}
                <div class="flex flex-row mt-2">
                    <div class="w-1/4">
                        <BarChart data={viewCountChartData} />
                    </div>
                    <div class="w-1/4">
                        <BarChart data={likeCountChartData} />
                    </div>
                    <div class="w-1/4">
                        <BarChart data={commentCountChartData} />
                    </div>
                    <div class="w-1/4">
                        <BarChart data={engagementCount} />
                    </div>
                </div>

                <table class="w-full text-xs text-gray-600 mt-8 border-collapse">
                    <thead class="text-left bg-neutral-100">
                    <tr>
                        <th></th>
                        <th class="py-2">動画タイトル</th>
                        <th class="text-right">視聴回数</th>
                        <th class="text-right">動画尺</th>
                        <th class="text-right">投稿日時</th>
                        <th class="text-right">Likes</th>
                        <th class="text-right">Comments</th>
                        <th class="text-right">エンゲージメント数</th>
                        <th class="text-right">エンゲージメント率</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each videos as video, index}
                        {@const duration = Durations.parseISO8601(video.duration)}
                        <tr class="border-y border-neutral-200">
                            <td>{`#${index + 1}`}</td>
                            <td class="py-2">
                                {#if video.isShort}
                                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-pink-600 bg-pink-200 last:mr-0 mr-1">
                                    short
                                </span>
                                {/if}
                                <a href={video.url}>{video.title}</a>
                            </td>
                            <td class="text-right">{video.viewCount.toLocaleString()}</td>
                            <td class="text-right">{#if duration.hours > 0}{String(duration.hours).padStart(2, '0')}:{/if}{String(duration.minutes).padStart(2, '0')}:{String(duration.seconds).padStart(2, '0')}</td>
                            <td class="text-right">{format(parseISO(video.publishedAt), 'yyyy/MM/dd HH:mm')}</td>
                            <td class="text-right">{video.likeCount.toLocaleString()}</td>
                            <td class="text-right">{video.commentCount.toLocaleString()}</td>
                            <td class="text-right">{(video.likeCount + video.commentCount).toLocaleString()}</td>
                            <td class="text-right">{((Math.round(video.likeCount + video.commentCount) / video.viewCount * 10_000) / 100).toLocaleString()}%</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            {/if}
        </article>

        {#if isSearchFormVisible}
            <div class="w-full h-full opacity-25 bg-black absolute" on:click={() => isSearchFormVisible = false}></div>
        {/if}
    </section>
</div>
