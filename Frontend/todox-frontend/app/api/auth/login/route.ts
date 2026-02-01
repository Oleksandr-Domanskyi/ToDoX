import { NextResponse } from "next/server";

type LoginRequest = {
	email: string;
	password: string;
	isPersistent: boolean;
	lockoutOnFailure: boolean;
};

type BackendLoginResponse = {
	tokenType: "Bearer" | string;
	accessToken: string;
	expiresIn: number;
	refreshToken: string;
};

export async function POST(req: Request) {
	const body = (await req.json()) as LoginRequest;

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
				email: body.email,
				password: body.password,
				isPersistent: body.isPersistent ?? false,
				lockoutOnFailure: body.lockoutOnFailure ?? false,
			}),
		});

		const raw = await r.text();

		if (!r.ok) {
			return new NextResponse(raw || "Login failed", {
				status: r.status,
				headers: {
					"content-type":
						r.headers.get("content-type") ?? "text/plain; charset=utf-8",
				},
			});
		}
		let data: BackendLoginResponse;
		try {
			data = JSON.parse(raw) as BackendLoginResponse;
		} catch {
			return NextResponse.json(
				{ error: "Backend returned non-JSON login response", raw },
				{ status: 502 },
			);
		}

		if (!data?.accessToken || !data?.refreshToken) {
			return NextResponse.json(
				{ error: "Backend login response missing tokens" },
				{ status: 502 },
			);
		}

		const res = NextResponse.json(
			{ ok: true, tokenType: data.tokenType, expiresIn: data.expiresIn },
			{ status: 200 },
		);

		const secure = process.env.NODE_ENV === "production";
		const accessMaxAge = Math.max(1, Math.floor(data.expiresIn));
		const refreshMaxAge = 30 * 24 * 60 * 60;

		res.cookies.set("access_token", data.accessToken, {
			httpOnly: true,
			secure,
			sameSite: "lax",
			path: "/",
			maxAge: accessMaxAge,
		});

		res.cookies.set("refresh_token", data.refreshToken, {
			httpOnly: true,
			secure,
			sameSite: "lax",
			path: "/",
			maxAge: refreshMaxAge,
		});

		res.cookies.set("token_type", data.tokenType ?? "Bearer", {
			httpOnly: true,
			secure,
			sameSite: "lax",
			path: "/",
			maxAge: refreshMaxAge,
		});

		return res;
	} catch (err) {
		console.error("FETCH TO BACKEND FAILED:", err);
		return NextResponse.json(
			{ error: "Cannot reach backend API" },
			{ status: 500 },
		);
	}
}
