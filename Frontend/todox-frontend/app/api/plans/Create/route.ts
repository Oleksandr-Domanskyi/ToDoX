import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function backendApiBase(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");

	const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
	const base = backendUrl.replace(/\/+$/, "");

	return `${base}/api/${apiVersion}`;
}

async function getAccessToken(): Promise<string | null> {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

export async function POST(req: Request) {
	try {
		const token = await getAccessToken();
		if (!token)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.text();

		const r = await fetch(`${backendApiBase()}Plans/plans`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": req.headers.get("content-type") ?? "application/json",
				Accept: "application/json",
			},
			body,
		});

		const text = await r.text();
		return new NextResponse(text, {
			status: r.status,
			headers: {
				"content-type":
					r.headers.get("content-type") ?? "application/json; charset=utf-8",
			},
		});
	} catch (e) {
		console.error("POST /api/plans failed:", e);
		return NextResponse.json(
			{ error: "Proxy failed", details: String(e) },
			{ status: 500 },
		);
	}
}
