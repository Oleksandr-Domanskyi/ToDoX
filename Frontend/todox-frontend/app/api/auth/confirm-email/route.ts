import { NextResponse } from "next/server";

function trimTrailingSlashes(url: string): string {
	let s = url;
	while (s.endsWith("/")) s = s.slice(0, -1);
	return s;
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string | null {
	return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(req: Request) {
	let bodyUnknown: unknown;
	try {
		bodyUnknown = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const userId = isRecord(bodyUnknown) ? readString(bodyUnknown.userId) : null;
	const token = isRecord(bodyUnknown) ? readString(bodyUnknown.token) : null;

	if (!userId || !token) {
		return NextResponse.json(
			{ error: "userId and token are required" },
			{ status: 400 },
		);
	}

	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) {
		return NextResponse.json(
			{ error: "BACKEND_URL is not set" },
			{ status: 500 },
		);
	}

	const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
	const base = trimTrailingSlashes(backendUrl);

	const BACKEND_PATH = "account/confirm-email";

	const target = `${base}/api/${apiVersion}/${BACKEND_PATH}`;

	const r = await fetch(target, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify({ userId, token }),
	});

	const text = await r.text();

	return new NextResponse(
		text || (r.ok ? JSON.stringify({ ok: true }) : "Confirm email failed"),
		{
			status: r.status,
			headers: {
				"content-type":
					r.headers.get("content-type") ?? "application/json; charset=utf-8",
			},
		},
	);
}
