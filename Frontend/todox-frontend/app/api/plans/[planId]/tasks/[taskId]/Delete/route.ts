import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Ctx = {
	params: Promise<{
		planId: string;
		taskId: string;
	}>;
};

async function getAccessToken(): Promise<string | null> {
	const c = await cookies();
	return c.get("access_token")?.value ?? null;
}

function backendBase(): string {
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");
	return backendUrl.replace(/\/$/, "");
}

function isBad(v?: string | null) {
	return !v || v === "undefined" || v === "null";
}

export async function DELETE(_req: Request, ctx: Ctx) {
	const { planId, taskId } = await ctx.params;

	if (isBad(planId)) {
		return NextResponse.json({ error: "planId is required" }, { status: 400 });
	}

	if (isBad(taskId)) {
		return NextResponse.json({ error: "taskId is required" }, { status: 400 });
	}

	const token = await getAccessToken();
	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const target = `${backendBase()}/plans/${encodeURIComponent(
		planId,
	)}/tasks/${encodeURIComponent(taskId)}/Delete`;

	const r = await fetch(target, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
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
