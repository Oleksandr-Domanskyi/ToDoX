import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ planId: string }> };

function backendApiBase(): string {
	const u = process.env.BACKEND_URL;
	if (!u) throw new Error("BACKEND_URL is not set");

	const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
	const base = u.replace(/\/+$/, "");

	return `${base}/api/${apiVersion}`;
}

async function token() {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

function isBadId(id: string | undefined | null): boolean {
	return !id || id === "undefined" || id === "null";
}

export async function POST(req: Request, ctx: Ctx) {
	const { planId } = await ctx.params;

	if (isBadId(planId)) {
		return NextResponse.json({ error: "planId is required" }, { status: 400 });
	}

	const t = await token();
	if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.text();

	const r = await fetch(
		`${backendApiBase()}/Plans/plans/${encodeURIComponent(planId)}/tasks`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${t}`,
				"Content-Type": req.headers.get("content-type") ?? "application/json",
				Accept: "application/json",
			},
			body,
			cache: "no-store",
		},
	);

	const text = await r.text();
	return new NextResponse(text, {
		status: r.status,
		headers: {
			"content-type":
				r.headers.get("content-type") ?? "application/json; charset=utf-8",
		},
	});
}
