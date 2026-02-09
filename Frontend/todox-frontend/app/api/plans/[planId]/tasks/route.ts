import { trimTrailingSlashes } from "@/shared/lib/url";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function backendApiBase(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");

	const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
	const base = trimTrailingSlashes(backendUrl);

	return `${base}/api/${apiVersion}`;
}

async function getAccessToken(): Promise<string | null> {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

type Ctx = { params: Promise<{ planId: string }> };

function isBadId(id: string | undefined | null): boolean {
	return !id || id === "undefined" || id === "null";
}

export async function GET(_req: Request, ctx: Ctx) {
	try {
		const { planId } = await ctx.params;

		if (isBadId(planId)) {
			return NextResponse.json(
				{ error: "planId is required" },
				{ status: 400 },
			);
		}

		const token = await getAccessToken();
		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const target = `${backendApiBase()}/Plans/${encodeURIComponent(planId)}/tasks`;

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
