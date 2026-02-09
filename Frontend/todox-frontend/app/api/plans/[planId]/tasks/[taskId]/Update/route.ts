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

function backendApiBase(): string {
	// серверные env (не NEXT_PUBLIC)
	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) throw new Error("BACKEND_URL is not set");

	const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
	const base = backendUrl.replace(/\/+$/, "");
	return `${base}/api/${apiVersion}`;
}

function isBad(v?: string | null) {
	return !v || v === "undefined" || v === "null";
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toFlatBlockDto(block: unknown): Record<string, unknown> {
	// unwrap { data: ... }
	const u =
		isRecord(block) && "data" in block ?
			(block as { data: unknown }).data
		:	block;

	const b = isRecord(u) ? u : {};

	// type (поддержка type/Type)
	const rawType = (b.type ?? b.Type) as unknown;

	let type: "text" | "image" | "checklist" | "code" = "text";
	if (
		rawType === "text" ||
		rawType === "image" ||
		rawType === "checklist" ||
		rawType === "code"
	) {
		type = rawType;
	} else {
		// эвристика по полям
		if (
			typeof b.richTextJson === "string" ||
			typeof b.RichTextJson === "string"
		)
			type = "text";
		else if (typeof b.imageUrl === "string" || typeof b.ImageUrl === "string")
			type = "image";
		else if (Array.isArray(b.items) || Array.isArray(b.Items))
			type = "checklist";
		else if (
			typeof b.codeContent === "string" ||
			typeof b.CodeContent === "string"
		)
			type = "code";
	}

	const flat: Record<string, unknown> = {
		type,
		id: b.id ?? b.Id,
		order: b.order ?? b.Order,
		position: b.position ?? b.Position,
		row: b.row ?? b.Row,
	};

	if (type === "text") {
		flat.richTextJson = b.richTextJson ?? b.RichTextJson ?? "";
	} else if (type === "image") {
		flat.imageUrl = b.imageUrl ?? b.ImageUrl ?? "";
		flat.captionRichTextJson =
			b.captionRichTextJson ?? b.CaptionRichTextJson ?? "";
	} else if (type === "checklist") {
		flat.items = b.items ?? b.Items ?? [];
	} else {
		flat.codeContent = b.codeContent ?? b.CodeContent ?? "";
		flat.language = b.language ?? b.Language ?? "ts";
	}

	return flat;
}

export async function PUT(req: Request, ctx: Ctx) {
	try {
		const { planId, taskId } = await ctx.params;

		if (isBad(planId)) {
			return NextResponse.json(
				{ error: "planId is required" },
				{ status: 400 },
			);
		}
		if (isBad(taskId)) {
			return NextResponse.json(
				{ error: "taskId is required" },
				{ status: 400 },
			);
		}

		const token = await getAccessToken();
		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		let payload: unknown;
		try {
			payload = await req.json();
		} catch {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
		}

		if (isRecord(payload) && Array.isArray(payload.blocks)) {
			payload = { ...payload, blocks: payload.blocks.map(toFlatBlockDto) };
		}

		const target = `${backendApiBase()}/Plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(taskId)}`;
		const outgoing = JSON.stringify(payload);

		console.log("[proxy outgoing PUT]", outgoing);

		const r = await fetch(target, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: outgoing,
			cache: "no-store",
		});

		const text = await r.text();

		return new NextResponse(text, {
			status: r.status,
			headers: {
				"x-proxy-hit": "plans-update",
				"content-type":
					r.headers.get("content-type") ?? "application/json; charset=utf-8",
			},
		});
	} catch (e) {
		console.error("PUT /api/plans/[planId]/tasks/[taskId]/Update failed:", e);
		return NextResponse.json(
			{ error: "Proxy failed", details: String(e) },
			{ status: 500 },
		);
	}
}
