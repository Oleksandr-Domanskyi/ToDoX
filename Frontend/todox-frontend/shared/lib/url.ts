export function trimTrailingSlashes(url: string): string {
	let s = url;
	while (s.endsWith("/")) {
		s = s.slice(0, -1);
	}
	return s;
}
