import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ planId: string }> };

async function getAccessToken(): Promise<string | null> {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

function backendBase(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");
	return backendUrl.replace(/\/$/, "");
}

function isBadId(id: string | undefined | null): boolean {
	return !id || id === "undefined" || id === "null";
}

function buildTarget(method: string, backendUrl: string, id: string): string {
	if (method === "DELETE") {
		// бекенд: DELETE /plans/Delete/{id:guid}
		return `${backendUrl}/plans/Delete/${encodeURIComponent(id)}`;
	}
	// GET /plans/{id}
	return `${backendUrl}/plans/${encodeURIComponent(id)}`;
}

async function forward(req: Request, method: string, id: string) {
	if (isBadId(id)) {
		return NextResponse.json({ error: "id is required" }, { status: 400 });
	}

	const token = await getAccessToken();
	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const backendUrl = backendBase();
	const target = buildTarget(method, backendUrl, id);

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

export async function GET(req: Request, ctx: Ctx) {
	const { planId } = await ctx.params;
	return forward(req, "GET", planId);
}

export async function DELETE(req: Request, ctx: Ctx) {
	const { planId } = await ctx.params;
	return forward(req, "DELETE", planId);
}
