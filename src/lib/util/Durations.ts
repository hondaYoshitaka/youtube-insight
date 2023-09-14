const iso8601DurationRegex =
	/(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;

export default class Durations {
	static parseISO8601 = function (duration: string) {
		const matches = duration.match(iso8601DurationRegex);

		if (matches == null) {
			return null;
		}
		return {
			sign: matches[1] == null ? '+' : '-',
			years: matches[2] ?? 0,
			months: matches[3] ?? 0,
			weeks: matches[4] ?? 0,
			days: matches[5] ?? 0,
			hours: matches[6] ?? 0,
			minutes: matches[7] ?? 0,
			seconds: matches[8] ?? 0
		};
	};
}
