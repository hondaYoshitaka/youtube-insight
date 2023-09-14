import type { RequestEvent } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { YOUTUBE_DATA_API_KEY } from '$env/static/private';
import { youtube_v3 } from '@googleapis/youtube';
import ky from 'ky';
import { GaxiosError } from 'gaxios/build/src/common';

const youtubeDataAPI = new youtube_v3.Youtube({
	auth: YOUTUBE_DATA_API_KEY
});

const MAX_FETCH_SIZE = 50;

export async function GET({ url }: RequestEvent) {
	const playlistId = url.searchParams.get('playlistId');
	if (playlistId == null || playlistId.length === 0) {
		throw error(400, '"playlistId" is required');
	}
	const videoTypes = url.searchParams.get('videoTypes');
	if (videoTypes == null || videoTypes.length === 0) {
		throw error(400, '"videoTypes" is required');
	}
	const limit = url.searchParams.get('limit') ?? '10';
	if (limit.match(/^%d+$/) && +limit > 0 && +limit <= MAX_FETCH_SIZE) {
		throw error(400, `"limit" must be between 1 and ${MAX_FETCH_SIZE}`);
	}

	let playlistItemsResponse;
	try {
		// プレイリスト https://developers.google.com/youtube/v3/docs/playlistItems
		playlistItemsResponse = await youtubeDataAPI.playlistItems.list({
			playlistId: playlistId,
			part: ['snippet'],
			maxResults: MAX_FETCH_SIZE
		});
	} catch (err) {
		if (err instanceof GaxiosError && err.status === 404) {
			throw error(404, `playlist is not found [id: ${playlistId}]`);
		}
		throw err;
	}
	const videoIds = playlistItemsResponse.data.items
		?.map((item) => item.snippet?.resourceId?.videoId)
		?.filter((item): item is string => item != null);
	if (videoIds == null || videoIds.length === 0) {
		throw error(404, `playlist videos is not found [playlist id: ${playlistId}]`);
	}

	const videoIdAndTypeMapping = new Map<string, 'video' | 'short'>();
	for (const ids of arrayChunk(videoIds, Math.max(+limit, 25))) {
		const mappings = await Promise.all(
			ids.map(async (id) => ({
				id,
				isShort: await isShortVideo(id)
			}))
		);
		mappings.forEach(({ id, isShort }) => {
			if (videoIdAndTypeMapping.size >= +limit) return;

			if (videoTypes.includes('video') && !isShort) {
				videoIdAndTypeMapping.set(id, 'video');
			}
			if (videoTypes.includes('short') && isShort) {
				videoIdAndTypeMapping.set(id, 'short');
			}
		});
		if (videoIdAndTypeMapping.size >= +limit) {
			break;
		}
	}

	// 動画 https://developers.google.com/youtube/v3/docs/videos
	const response = await youtubeDataAPI.videos.list({
		id: [...videoIdAndTypeMapping.keys()],
		part: ['snippet', 'statistics', 'contentDetails']
	});
	if (response.data.items == null) {
		throw error(404);
	}
	const videos = await Promise.all(
		response.data.items.map(async (data) => ({
			url: data.id ? `https://youtube.com/watch?v=${data.id}` : '',
			title: data.snippet?.localized?.title,
			description: data.snippet?.localized?.description,
			thumbnailUrl: data.snippet?.thumbnails?.default?.url,
			duration: data.contentDetails?.duration,
			publishedAt: data.snippet?.publishedAt,
			viewCount: data.statistics?.viewCount ? +data.statistics.viewCount : 0,
			likeCount: data.statistics?.likeCount ? +data.statistics.likeCount : 0,
			commentCount: data.statistics?.commentCount ? +data.statistics.commentCount : 0,
			tags: data.snippet?.tags,
			isShort: data.id ? videoIdAndTypeMapping.get(data.id) === 'short' : undefined
		}))
	);
	return json(videos);
}

async function isShortVideo(videoId: string) {
	// @see https://zenn.dev/nukokoi/articles/6f9c4775c40bdb
	const response = await ky.head(`https://youtube.com/shorts/${videoId}`);

	return /\/shorts\//.test(response.url);
}

// HACK: 余裕があればutilsに切り出す
function arrayChunk<T>(array: T[], size: number): T[][] {
	if (size <= 0) return [[]];
	const result = [];
	for (let i = 0, j = array.length; i < j; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}
