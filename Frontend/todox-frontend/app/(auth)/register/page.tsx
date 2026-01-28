"use client";

import styles from "@/styles/auth.module.css";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function RegisterPage() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [show, setShow] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const passwordMismatch = useMemo(
		() =>
			password.length > 0 &&
			confirmPassword.length > 0 &&
			password !== confirmPassword,
		[password, confirmPassword],
	);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (passwordMismatch) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);

		try {
			const r = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					email,
					password,
					confirmPassword,
					role: "User",
					subscription: "Default",
					imageUrl: "",
				}),
			});

			if (!r.ok) {
				let msg = "Registration failed";
				const ct = r.headers.get("content-type") ?? "";
				try {
					if (ct.includes("application/json")) {
						const data: unknown = await r.json();
						msg = extractErrorMessage(data) ?? msg;
					} else {
						const text = await r.text();
						if (text) msg = text;
					}
				} catch {}
				setError(msg);
				return;
			}

			router.push("/confirm-email-sent");
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

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
							Create account
						</span>
					</div>

					<h3 className={styles.sideTitle}>Join ToDoX</h3>
					<p className={styles.sideLead}>
						Create your workspace. We’ll send a confirmation email
						automatically.
					</p>

					{/* NEW: not duplicating login info */}
					<div className={styles.registerInfo}>
						<div className={styles.infoCard}>
							<div className={styles.infoTitle}>Next steps</div>
							<ul className={styles.infoList}>
								<li>We’ll email you a confirmation link.</li>
								<li>Click it to activate your workspace.</li>
								<li>Then you can sign in immediately.</li>
							</ul>
						</div>

						<div className={styles.infoCard}>
							<div className={styles.infoTitle}>Privacy & security</div>
							<ul className={styles.infoList}>
								<li>Your email is used only for account access.</li>
								<li>Passwords are stored securely (hashed).</li>
								<li>You can delete your account anytime.</li>
							</ul>
						</div>
					</div>

					<div className={styles.sideFooter}>
						<button type="button" onClick={() => router.push("/login")}>
							I already have an account
						</button>
					</div>
				</aside>

				{/* RIGHT */}
				<section className={styles.formPane}>
					<div className={styles.formBox}>
						<header className={styles.header}>
							<h1>Create account</h1>
							<p>Fill in your details to start using ToDoX.</p>
						</header>

						{error && <div className={styles.error}>{error}</div>}

						<form onSubmit={onSubmit} className={styles.form}>
							<div>
								<div className={styles.fieldTop}>
									<span className={styles.label}>Name</span>
								</div>
								<div className={styles.inputWrap}>
									<input
										className={styles.input}
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
										autoComplete="name"
									/>
								</div>
							</div>

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
								</div>
								<div className={styles.inputWrap}>
									<input
										className={styles.input}
										type={show ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										autoComplete="new-password"
									/>
									<button
										type="button"
										className={styles.inputAction}
										onClick={() => setShow((s) => !s)}>
										{show ? "Hide" : "Show"}
									</button>
								</div>
							</div>

							<div>
								<div className={styles.fieldTop}>
									<span className={styles.label}>Confirm password</span>
								</div>
								<div className={styles.inputWrap}>
									<input
										className={styles.input}
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="••••••••"
										autoComplete="new-password"
									/>
								</div>
							</div>

							{passwordMismatch && (
								<div className={styles.error}>Passwords do not match.</div>
							)}

							<div className={styles.actions}>
								<button
									className={styles.primaryBtn}
									type="submit"
									disabled={loading}>
									{loading ? "Creating..." : "Create account"}
								</button>
							</div>
						</form>
					</div>
				</section>
			</div>
		</div>
	);
}
