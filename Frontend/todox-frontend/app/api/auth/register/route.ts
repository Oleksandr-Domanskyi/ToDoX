import { NextResponse } from "next/server";

type RegisterRequest = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	role?: string;
	subscription?: string;
	imageUrl?: string;
};

export async function POST(req: Request) {
	const body = (await req.json()) as RegisterRequest;

	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) {
		return NextResponse.json(
			{ error: "BACKEND_URL is not set" },
			{ status: 500 },
		);
	}

	try {
		const apiVersion = process.env.BACKEND_API_VERSION ?? "v1";
		const base = backendUrl.replace(/\/+$/, "");

		const r = await fetch(`${base}/api/${apiVersion}/account/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: body.name,
				email: body.email,
				password: body.password,
				confirmPassword: body.confirmPassword,
				role: body.role ?? "User",
				subscription: body.subscription ?? "Default",
				imageUrl: body.imageUrl ?? "",
			}),
		});

		const text = await r.text();

		return new NextResponse(
			text || (r.ok ? JSON.stringify({ ok: true }) : "Registration failed"),
			{
				status: r.status,
				headers: {
					"content-type":
						r.headers.get("content-type") ?? "application/json; charset=utf-8",
				},
			},
		);
	} catch (err) {
		console.error("FETCH TO BACKEND FAILED:", err);
		return NextResponse.json(
			{ error: "Cannot reach backend API" },
			{ status: 500 },
		);
	}
}
