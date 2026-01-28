import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function backendBase(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");
	return backendUrl.replace(/\/$/, "");
}

async function getAccessToken(): Promise<string | null> {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

type Ctx = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
	try {
		const { planId } = await ctx.params;

		if (!planId || planId === "undefined" || planId === "null") {
			return NextResponse.json(
				{ error: "planId is required" },
				{ status: 400 },
			);
		}

		const token = await getAccessToken();
		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const target = `${backendBase()}/plans/${encodeURIComponent(planId)}/tasks`;

		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), 30_000);

		const r = await fetch(target, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
			},
			signal: controller.signal,
			cache: "no-store",
		});

		clearTimeout(t);

		const body = await r.text();
		return new NextResponse(body, {
			status: r.status,
			headers: {
				"content-type":
					r.headers.get("content-type") ?? "application/json; charset=utf-8",
			},
		});
	} catch (e) {
		console.error("GET /api/plans/[planId]/tasks failed:", e);
		return NextResponse.json(
			{ error: "Proxy failed", details: String(e) },
			{ status: 500 },
		);
	}
}
