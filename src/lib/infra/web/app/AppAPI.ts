import ky from "ky";
import {XMLParser} from "fast-xml-parser";

export default class AppAPI {
    async fetchYoutubeChannelBy(handleName: string): Promise<object> {
        return await ky.get(`/api/youtube-channel`, {
            searchParams: {handleName}
        }).json();
    }
    async fetchYoutubeVideosBy(playlistId: string, videoTypes: string[], limit: number = 10): Promise<object[]> {
        return await ky.get(`/api/youtube-videos`, {
            searchParams: {playlistId, videoTypes: videoTypes.join(','), limit}
        }).json();
    }
}
