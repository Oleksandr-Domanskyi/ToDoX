"use client";

import styles from "@/styles/auth.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Suspense,
	useCallback,
	useMemo,
	useState,
	type FormEvent,
} from "react";

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

function extractErrorMessage(v: unknown): string | null {
	if (!isRecord(v)) return null;

	const err = v["error"];
	if (typeof err === "string" && err.trim().length > 0) return err;

	const msg = v["message"];
	if (typeof msg === "string" && msg.trim().length > 0) return msg;

	return null;
}

function LoginInner() {
	const router = useRouter();
	const sp = useSearchParams();

	const next = useMemo(() => sp.get("next") ?? "/plans", [sp]);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const onSubmit = useCallback(
		async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setError(null);
			setLoading(true);

			try {
				const r = await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});

				if (!r.ok) {
					let msg = "Login failed";
					const ct = r.headers.get("content-type") ?? "";

					try {
						if (ct.includes("application/json")) {
							const data: unknown = await r.json();
							msg = extractErrorMessage(data) ?? msg;
						} else {
							const text = await r.text();
							if (text) msg = text;
						}
					} catch {
						// ignore parse errors
					}

					setError(msg);
					return;
				}

				router.push(next);
				router.refresh();
			} catch {
				setError("Network error. Please try again.");
			} finally {
				setLoading(false);
			}
		},
		[email, password, next, router],
	);

	return (
		<div className={styles.authPage}>
			<div className={styles.authCard}>
				<div className={styles.splitDivider} />

				{/* LEFT */}
				<aside className={styles.side}>
					<div className={styles.brandRow}>
						<div className={styles.brandLeft}>
							<div className={styles.logo} aria-hidden="true" />
							<div className={styles.appName}>ToDoX</div>
						</div>

						<span className={styles.badge}>
							<span className={styles.badgeDot} aria-hidden="true" />
							Workspace
						</span>
					</div>

					<h3 className={styles.sideTitle}>Plan → execute, without noise</h3>
					<p className={styles.sideLead}>
						Focused workspace for turning plans into structured tasks. Keep
						context, move fast, and work in clean layouts.
					</p>

					<ul className={styles.sideList}>
						<li className={styles.sideItem}>
							<div className={styles.sideItemTitle}>Plans → tasks → blocks</div>
							<div className={styles.sideItemText}>
								Hierarchy keeps everything connected so you never lose context.
							</div>
						</li>
						<li className={styles.sideItem}>
							<div className={styles.sideItemTitle}>Layouts & focus modes</div>
							<div className={styles.sideItemText}>
								Split work into clear sections and switch instantly.
							</div>
						</li>
						<li className={styles.sideItem}>
							<div className={styles.sideItemTitle}>Secure access</div>
							<div className={styles.sideItemText}>
								Token auth and protected routes by default.
							</div>
						</li>
					</ul>
				</aside>

				{/* RIGHT */}
				<section className={styles.formPane}>
					<div className={styles.formBox}>
						<header className={styles.header}>
							<h1>Welcome back</h1>
							<p>Sign in to your workspace and continue your plans.</p>

							<div className={styles.chips}>
								<span className={styles.chip}>
									<span className={styles.chipDot} aria-hidden="true" />
									Token auth
								</span>
								<span className={styles.chip}>
									<span className={styles.chipDot} aria-hidden="true" />
									Fast navigation
								</span>
								<span className={styles.chip}>
									<span className={styles.chipDot} aria-hidden="true" />
									Keyboard friendly
								</span>
							</div>
						</header>

						{error && <div className={styles.error}>{error}</div>}

						<form onSubmit={onSubmit} className={styles.form}>
							<div>
								<div className={styles.fieldTop}>
									<span className={styles.label}>Email</span>
								</div>

								<div className={styles.inputWrap}>
									<input
										className={styles.input}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="name@example.com"
										autoComplete="email"
										inputMode="email"
									/>
								</div>
							</div>

							<div>
								<div className={styles.fieldTop}>
									<span className={styles.label}>Password</span>
									<button
										type="button"
										className={styles.linkInline}
										onClick={() => router.push("/resend-confirmation")}>
										Forgot?
									</button>
								</div>

								<div className={styles.inputWrap}>
									<input
										className={styles.input}
										type={show ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										autoComplete="current-password"
									/>
									<button
										type="button"
										className={styles.inputAction}
										onClick={() => setShow((s) => !s)}>
										{show ? "Hide" : "Show"}
									</button>
								</div>
							</div>

							<div className={styles.actions}>
								<button
									className={styles.primaryBtn}
									type="submit"
									disabled={loading}>
									{loading ? "Signing in..." : "Sign in"}
								</button>
							</div>
						</form>

						<div className={styles.footer}>
							<span>
								If you don`t have account:{" "}
								<button
									type="button"
									className={styles.footerLink}
									onClick={() => router.push("/register")}>
									Create account
								</button>
							</span>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginInner />
		</Suspense>
	);
}
