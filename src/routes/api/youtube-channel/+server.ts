import type {RequestEvent} from "@sveltejs/kit";
import {error, json} from "@sveltejs/kit";
import {youtube_v3} from "@googleapis/youtube";
import {XMLParser} from "fast-xml-parser";
import ky, {HTTPError} from "ky";

import {YOUTUBE_DATA_API_KEY} from '$env/static/private';

const youtubeDataAPI = new youtube_v3.Youtube({
    auth: YOUTUBE_DATA_API_KEY
});

const xmlParser = new XMLParser({ ignoreAttributes: false })

export async function GET({url}: RequestEvent) {
    const handleName = url.searchParams.get('handleName');
    if (handleName == null) {
        throw error(400, '"handleName" is required')
    }

    const channelResponse = await fetchChannelBy(handleName);
    if (channelResponse == null) {
        throw error(404)
    }
    // チャンネル https://developers.google.com/youtube/v3/docs/channels
    const response = await youtubeDataAPI.channels.list({
        id: [channelResponse.channelId],
        part: ['snippet','contentDetails','statistics'],
    });
    if (response.data.items == null) {
        throw error(404)
    }
    const {snippet, contentDetails, statistics } = response.data.items[0];
    const channel = {
        title: snippet?.title,
        thumbnailUrl: snippet?.thumbnails?.default?.url,
        publishedAt: snippet?.publishedAt,
        subscriberCount: statistics?.subscriberCount ? +statistics.subscriberCount : 0,
        videoCount: statistics?.videoCount ? +statistics.videoCount : 0,
        viewCount: statistics?.viewCount ? +statistics.viewCount : 0,
        playlistId: contentDetails?.relatedPlaylists?.uploads,
    };

    return json(channel);
}

async function fetchChannelBy(handleName: string): Promise<{channelId: string; latestVideos: object[]} | undefined> {
    let channelPageHTML
    try {
        channelPageHTML = await ky.get(`https://www.youtube.com/${handleName}`).text();
    } catch (err) {
        if (err instanceof HTTPError && err.response.status === 404) {
            return;
        }
        throw err;
    }
    const rssFeedURL = /https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?(?:channel_id|user)=[0-9a-zA-Z_\-]+/.exec(channelPageHTML);
    if (rssFeedURL == null) {
        throw new Error('unexpected error occurred')
    }

    const rssXML = xmlParser.parse(await ky.get(rssFeedURL[0]).text());
    const latestVideos = rssXML.feed.entry.map((entry: any) => ({
        videoId: entry['yt:videoId'],
        title: entry['media:group']['media:title'],
        thumbnailUrl: entry['media:group']['media:thumbnail']['@_url'],
        description: entry['media:group']['media:description'],
        viewCount: entry['media:group']['media:community']['media:statistics']['@_views'],
    }));
    return {
        channelId: rssXML.feed.author.uri.split('/').pop(),
        latestVideos,
    }
}
