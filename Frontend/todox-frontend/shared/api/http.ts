export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const urlPath =
		normalizedPath.startsWith("/api/") ? normalizedPath : (
			`/api${normalizedPath}`
		);

	const res = await fetch(`${API_URL}${urlPath}`, {
		...init,
		credentials: "include",
		headers: {
			...(init?.headers ?? {}),
			...(init?.body ? { "Content-Type": "application/json" } : {}),
			Accept: "application/json",
		},
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `HTTP ${res.status}`);
	}

	if (res.status === 204) return undefined as T;

	const ct = res.headers.get("content-type") ?? "";
	if (ct.includes("application/json")) {
		return (await res.json()) as T;
	}

	return (await res.text()) as unknown as T;
}
