import { trimTrailingSlashes } from "@/shared/lib/url";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ planId: string }> };

async function getAccessToken(): Promise<string | null> {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

function backendApiBase(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");

	const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
	const base = trimTrailingSlashes(backendUrl);
	return `${base}/api/${apiVersion}`;
}

function isBadId(id: string | undefined | null): boolean {
	return !id || id === "undefined" || id === "null";
}

function buildTarget(method: string, backendApi: string, id: string): string {
	return `${backendApi}/Plans/plans/${encodeURIComponent(id)}`;
}

async function forward(method: string, id: string) {
	if (isBadId(id)) {
		return NextResponse.json({ error: "id is required" }, { status: 400 });
	}

	const token = await getAccessToken();
	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const backendApi = backendApiBase();
	const target = buildTarget(method, backendApi, id);

	const headers = new Headers();
	headers.set("Authorization", `Bearer ${token}`);
	headers.set("Accept", "application/json");

	const r = await fetch(target, {
		method,
		headers,
		cache: "no-store",
	});

	const text = await r.text();
	return new NextResponse(text, {
		status: r.status,
		headers: {
			"content-type":
				r.headers.get("content-type") ?? "application/json; charset=utf-8",
		},
	});
}

export async function GET(_req: Request, ctx: Ctx) {
	const { planId } = await ctx.params;
	return forward("GET", planId);
}

export async function DELETE(_req: Request, ctx: Ctx) {
	const { planId } = await ctx.params;
	return forward("DELETE", planId);
}
