<script>
    import AppAPI from '$lib/infra/web/app/AppAPI';
    import {format, parseISO} from 'date-fns';
    import Fa from 'svelte-fa/src/fa.svelte';
    import {faYoutube} from '@fortawesome/free-brands-svg-icons';
    import Durations from '$lib/util/Durations';
    // import { Line } from "svelte-chartjs";
    // import 'chart.js/auto';

    let handleName = '';
    let videoTypes = ['video', 'short'];
    let limit = 15;

    let channel = null;
    let videos = [];

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
        isShownSearchForm = false;

        channel = null;
        videos = [];

        channel = await appAPI.fetchYoutubeChannelBy(handleName);
        videos = await appAPI.fetchYoutubeVideosBy(channel.playlistId, videoTypes, limit);
    };

    let isShownSearchForm = false

    $: disabled = handleName.length === 0
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
                       on:focus={() => isShownSearchForm = true}
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

        {#if isShownSearchForm}
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
                                <p>[ave. {Math.round(averageViewCount).toLocaleString()}]</p>
                            </li>
                            <li class="w-40 border-l-[1px] border-gray-300 ml-4 pl-4">
                                <p class="mb-1">Likes</p>
                                {totalLikeCount.toLocaleString()}
                                <p>[ave. {Math.round(averageLikeCount).toLocaleString()}]</p>
                            </li>
                            <li class="w-40 border-l-[1px] border-gray-300 ml-4 pl-4">
                                <p class="mb-1">Comments</p>
                                {totalCommentCount.toLocaleString()}
                                <p>[ave. {Math.round(averageCommentCount).toLocaleString()}]</p>
                            </li>
                            <li class="w-40 border-l-[1px] border-gray-300 ml-4 pl-4">
                                <p class="mb-1">エンゲージメント</p>
                                {totalEngagementCount.toLocaleString()} ({Math.round(averageEngagementRate * 10_000) / 100}%)
                                <p>[ave. {Math.round(averageEngagementCount).toLocaleString()}]</p>
                            </li>
                        </ul>
                    </div>
                </div>
            {/if}

            <ul class="divide-y divide-slate-100">
                {#each videos as video}
                    {@const duration = Durations.parseISO8601(video.duration)}
                    <div class="flex items-start space-x-6 px-2 py-4">
                        <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                width="60"
                                height="88"
                                class="flex-none rounded-md bg-slate-100"
                        />

                        <div class="min-w-0 relative flex-auto">
                            <h2 class="font-semibold text-slate-900 truncate pr-20">
                                {#if video.isShort}
									<span
                                            class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-pink-600 bg-pink-200 last:mr-0 mr-1"
                                    >short</span
                                    >
                                {/if}
                                <a href={video.url}>{video.title}</a>
                            </h2>
                            <dl class="mt-2 flex flex-wrap text-sm leading-6 font-medium">
                                <div class="absolute top-0 right-0 flex items-center space-x-1">
                                    <dt class="text-sky-500">
                                        <span class="sr-only">Star rating</span>
                                        <svg width="16" height="20" fill="currentColor">
                                            <path
                                                    d="M7.05 3.691c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.372 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L.98 9.483c-.784-.57-.381-1.81.587-1.81H5.03a1 1 0 00.95-.69L7.05 3.69z"
                                            />
                                        </svg>
                                    </dt>
                                    <dd>{video.viewCount.toLocaleString()} 回視聴</dd>
                                </div>

                                <div>
                                    <dt class="sr-only">高く評価</dt>
                                    <dd class="px-1.5 ring-1 ring-slate-200 rounded">
                                        {video.likeCount.toLocaleString()} likes
                                    </dd>
                                </div>
                                <div class="ml-2">
                                    <dt class="sr-only">コメント</dt>
                                    <dd class="px-1.5 ring-1 ring-slate-200 rounded">
                                        {video.commentCount.toLocaleString()}
                                        comments
                                    </dd>
                                </div>
                                <div class="ml-2">
                                    <dt class="sr-only">動画尺</dt>
                                    <dd>
                                        {#if duration.hours > 0}{String(duration.hours).padStart(2, '0')}:{/if}{String(
                                        duration.minutes
                                    ).padStart(2, '0')}:{String(duration.seconds).padStart(2, '0')}
                                    </dd>
                                </div>
                                <div class="ml-2">
                                    <dt class="sr-only">投稿日時</dt>
                                    <dd>{format(parseISO(video.publishedAt), 'yyyy/MM/dd HH:mm')}</dd>
                                </div>

                                <div class="flex-none w-full mt-2 font-normal">
                                    <dt class="sr-only">タグ</dt>
                                    <dd class="text-slate-400">
                                        {video.tags?.map((tag) => `#${tag}`).join(' ') ?? ''}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                {/each}
            </ul>
        </article>

        {#if isShownSearchForm}
            <div class="w-full h-full opacity-25 bg-black absolute" on:click={() => isShownSearchForm = false}></div>
        {/if}
    </section>
</div>
