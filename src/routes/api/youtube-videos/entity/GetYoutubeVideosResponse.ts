export type GetYoutubeVideosResponse = YoutubeVideo[];

interface YoutubeVideo {
	url?: string | null;
	title?: string | null;
	description?: string | null;
	thumbnailUrl?: string | null;
	duration?: string | null;
	publishedAt?: string | null;
	viewCount: number;
	likeCount: number;
	commentCount: number;
	tags: string[];
	isShort?: boolean;
}
