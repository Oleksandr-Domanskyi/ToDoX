"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

function extractErrorMessage(v: unknown): string | null {
	if (!isRecord(v)) return null;

	const err = v["error"];
	if (typeof err === "string" && err.trim()) return err;

	const msg = v["message"];
	if (typeof msg === "string" && msg.trim()) return msg;

	return null;
}

type Status = "idle" | "loading" | "success" | "error";

export default function ConfirmEmailPage() {
	const sp = useSearchParams();
	const router = useRouter();

	const userId = useMemo(() => sp.get("userId") ?? "", [sp]);
	const token = useMemo(() => sp.get("token") ?? "", [sp]);

	const missingParams = useMemo(() => !userId || !token, [userId, token]);

	const [status, setStatus] = useState<Status>("idle");
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		if (missingParams) return;

		let cancelled = false;

		const run = async () => {
			setStatus("loading");
			setMessage("");

			const r = await fetch("/api/auth/confirm-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, token }),
			});

			if (cancelled) return;

			if (r.ok) {
				setStatus("success");
				setMessage("Email confirmed. You can sign in now.");
				setTimeout(() => router.push("/login"), 1200);
				return;
			}

			const ct = r.headers.get("content-type") ?? "";
			let msg = "Confirm email failed";

			try {
				if (ct.includes("application/json")) {
					const data: unknown = await r.json();
					msg = extractErrorMessage(data) ?? JSON.stringify(data);
				} else {
					const text = await r.text();
					if (text) msg = text;
				}
			} catch {
				// ignore
			}

			setStatus("error");
			setMessage(msg);
		};

		void run();

		return () => {
			cancelled = true;
		};
	}, [missingParams, userId, token, router]);

	if (missingParams) {
		return (
			<div style={{ maxWidth: 520, margin: "40px auto" }}>
				<h1>Confirm email</h1>
				<p style={{ color: "crimson" }}>Missing userId or token.</p>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: 520, margin: "40px auto" }}>
			<h1>Confirm email</h1>

			{status === "loading" && <p>Confirming…</p>}
			{status === "success" && <p style={{ color: "green" }}>{message}</p>}
			{status === "error" && <p style={{ color: "crimson" }}>{message}</p>}
			{status === "idle" && <p>Preparing…</p>}
		</div>
	);
}
