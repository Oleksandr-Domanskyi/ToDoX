import { NextResponse } from "next/server";

type ConfirmEmailRequest = {
	userId: string;
	token: string;
};

export async function POST(req: Request) {
	const body = (await req.json()) as ConfirmEmailRequest;

	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) {
		return NextResponse.json(
			{ error: "BACKEND_URL is not set" },
			{ status: 500 },
		);
	}

	const r = await fetch(`${backendUrl}/account/confirm-email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			userId: body.userId,
			token: body.token,
		}),
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
