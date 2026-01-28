import { NextResponse } from "next/server";

type LoginRequest = {
	email: string;
	password: string;
	isPersistent?: boolean;
	lockoutOnFailure?: boolean;
};

type LoginResponse = {
	accessToken?: string;
	token?: string;
	refreshToken?: string;
	expiresIn?: number;
};

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

function parseLoginResponse(v: unknown): LoginResponse | null {
	if (!isRecord(v)) return null;

	return {
		accessToken: typeof v.accessToken === "string" ? v.accessToken : undefined,
		token: typeof v.token === "string" ? v.token : undefined,
		refreshToken:
			typeof v.refreshToken === "string" ? v.refreshToken : undefined,
		expiresIn: typeof v.expiresIn === "number" ? v.expiresIn : undefined,
	};
}

export async function POST(req: Request) {
	const body = (await req.json()) as LoginRequest;

	const backendUrl = process.env.BACKEND_URL;
	if (!backendUrl) {
		return NextResponse.json(
			{ error: "BACKEND_URL is not set" },
			{ status: 500 },
		);
	}

	const r = await fetch(`${backendUrl}/account/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: body.email,
			password: body.password,
			isPersistent: body.isPersistent ?? false,
			lockoutOnFailure: body.lockoutOnFailure ?? false,
		}),
	});

	if (!r.ok) {
		const text = await r.text();
		return new NextResponse(text || "Registration failed", {
			status: r.status,
		});
	}

	let parsed: LoginResponse | null = null;
	const ct = r.headers.get("content-type") ?? "";

	if (ct.includes("application/json")) {
		const raw: unknown = await r.json();
		parsed = parseLoginResponse(raw);
	} else {
		const rawText = await r.text();
		try {
			const rawJson: unknown = JSON.parse(rawText);
			parsed = parseLoginResponse(rawJson);
		} catch {
			parsed = null;
		}
	}

	const accessToken = parsed?.accessToken ?? parsed?.token;

	const res = NextResponse.json({ ok: true });

	if (accessToken) {
		res.cookies.set("access_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});
	}

	if (parsed?.refreshToken) {
		res.cookies.set("refresh_token", parsed.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});
	}

	return res;
}
