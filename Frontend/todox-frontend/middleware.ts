import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set([
	"/login",
	"/register",
	"/confirm-email",
	"/confirm-email-sent",
]);

function isPublicPath(pathname: string) {
	if (PUBLIC_PATHS.has(pathname)) return true;
	for (const p of PUBLIC_PATHS) {
		if (pathname.startsWith(p + "/")) return true;
	}
	return false;
}

export function middleware(req: NextRequest) {
	const token = req.cookies.get("access_token")?.value;
	const { pathname } = req.nextUrl;

	if (isPublicPath(pathname)) {
		if (token && (pathname === "/login" || pathname === "/register")) {
			const url = req.nextUrl.clone();
			url.pathname = "/dashboard";
			return NextResponse.redirect(url);
		}
		return NextResponse.next();
	}

	if (!token) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("next", pathname);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Захищаємо все, крім _next, favicon і api (api ти і так перевіряєш токеном у route.ts)
		"/((?!_next|favicon.ico|api).*)",
	],
};
