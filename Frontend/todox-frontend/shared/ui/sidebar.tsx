"use client";

import Link from "next/link";
import styles from "@/styles/Sidebar.module.css";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { usePlans } from "@/features/plans/api/plans.queries";
import { mapPlans } from "@/features/plans/lib/mapPlans";
import { cn } from "../lib/cn/utils";

import { CreateTaskModal } from "@/features/tasks/ui/CreateTaskModal";
import { CreatePlanModal } from "@/features/plans/ui/CreatePlanModal";

import { deletePlan } from "@/features/plans/api/plans.api";
import { SettingsModal } from "./SettingsModal";

type SortDir = "asc" | "desc";

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const STORAGE_KEY = "sidebar-width";
const DEFAULT_WIDTH = 288;

const FILTER_STORAGE_KEY = "plans-filter-query";
const COLLAPSE_STORAGE_KEY = "sidebar-collapsed";

export function Sidebar() {
	const { data: plans, isLoading, error, refetch: refetchPlans } = usePlans();
	const pathname = usePathname();
	const router = useRouter();
	const path = usePathname();

	const [sortDir, setSortDir] = useState<SortDir>("asc");

	const [isResizing, setIsResizing] = useState(false);
	const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
	const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
	const [activePlanId, setActivePlanId] = useState<string | null>(null);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	// ===== Collapsed =====
	const [collapsed, setCollapsed] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		try {
			return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
		} catch {
			return false;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? "1" : "0");
		} catch {}
	}, [collapsed]);

	// ===== Sidebar width =====
	const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);

	useLayoutEffect(() => {
		const saved = window.localStorage.getItem(STORAGE_KEY);
		const n = saved ? Number(saved) : DEFAULT_WIDTH;

		const clamped =
			Number.isFinite(n) ?
				Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n))
			:	DEFAULT_WIDTH;

		if (clamped !== sidebarWidth) setSidebarWidth(clamped);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const shell = document.querySelector<HTMLElement>(".app_shell");
		if (!shell) return;

		const effective = collapsed ? 72 : sidebarWidth;
		shell.style.setProperty("--sidebar-w", `${effective}px`);
		window.localStorage.setItem(STORAGE_KEY, String(sidebarWidth));
	}, [sidebarWidth, collapsed]);

	const onResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
		if (collapsed) return;
		e.preventDefault();
		e.stopPropagation();

		setIsResizing(true);

		const startX = e.clientX;
		const startWidth = sidebarWidth;

		document.body.style.userSelect = "none";
		document.body.style.cursor = "col-resize";

		const onMouseMove = (ev: MouseEvent) => {
			const dx = ev.clientX - startX;
			const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + dx));
			setSidebarWidth(next);
		};

		const onMouseUp = () => {
			setIsResizing(false);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";

			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	};

	// ===== Inline filter =====
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filterQuery, setFilterQuery] = useState<string>(() => {
		if (typeof window === "undefined") return "";
		try {
			return localStorage.getItem(FILTER_STORAGE_KEY) ?? "";
		} catch {
			return "";
		}
	});

	const filterInputRef = useRef<HTMLInputElement | null>(null);
	const isFilterActive = filterQuery.trim().length > 0;

	useEffect(() => {
		try {
			localStorage.setItem(FILTER_STORAGE_KEY, filterQuery);
		} catch {}
	}, [filterQuery]);

	useEffect(() => {
		if (!isFilterOpen) return;
		const t = window.setTimeout(() => filterInputRef.current?.focus(), 0);
		return () => window.clearTimeout(t);
	}, [isFilterOpen]);

	useEffect(() => {
		if (!isFilterOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsFilterOpen(false);
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isFilterOpen]);

	const openOrFocusFilter = () => {
		if (collapsed) setCollapsed(false);
		setIsFilterOpen(true);
	};

	const clearFilter = () => {
		setFilterQuery("");
		setIsFilterOpen(false);
	};

	// ===== Filter + sort =====
	const filteredPlans = useMemo(() => {
		const list = plans ?? [];
		const q = filterQuery.trim().toLowerCase();
		if (!q) return list;
		return list.filter((p) => (p.name ?? "").toLowerCase().includes(q));
	}, [plans, filterQuery]);

	const sortedPlans = useMemo(() => {
		if (!filteredPlans.length) return filteredPlans;

		const copy = [...filteredPlans];
		copy.sort((a, b) => {
			const nameA = (a.name ?? "").toLocaleLowerCase();
			const nameB = (b.name ?? "").toLocaleLowerCase();
			const cmp = nameA.localeCompare(nameB);
			return sortDir === "asc" ? cmp : -cmp;
		});

		return copy;
	}, [filteredPlans, sortDir]);

	const items = mapPlans(sortedPlans, pathname);

	// ===== Actions =====
	const onAddTask = (planId: string) => {
		setActivePlanId(planId);
		setIsCreateTaskOpen(true);
	};

	const onEditPlan = (planId: string) => {
		// подключишь свой edit, когда будет
		console.log("edit plan", planId);
	};

	const onDeletePlan = async (planId: string) => {
		try {
			const isCurrentPlan =
				pathname === `/plans/${planId}` || path.startsWith(`/plans/${planId}/`);

			await deletePlan(planId);

			const result = await refetchPlans();
			const remaining = result.data ?? [];

			if (isCurrentPlan) {
				if (remaining.length > 0) router.push(`/plans/${remaining[0].id}`);
				else router.push("/plans");
			}
		} catch (e) {
			console.error("Failed to delete plan", e);
		}
	};

	// ===== Logout =====
	const onLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
		} finally {
			router.push("/login");
			router.refresh();
		}
	};

	// ===== Per-plan menu =====
	const [openMenuPlanId, setOpenMenuPlanId] = useState<string | null>(null);
	const openMenuRootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!openMenuPlanId) return;

		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (!target) return;

			if (
				openMenuRootRef.current &&
				!openMenuRootRef.current.contains(target)
			) {
				setOpenMenuPlanId(null);
			}
		};

		window.addEventListener("pointerdown", onPointerDown);
		return () => window.removeEventListener("pointerdown", onPointerDown);
	}, [openMenuPlanId]);

	useEffect(() => {
		if (!openMenuPlanId) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpenMenuPlanId(null);
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [openMenuPlanId]);

	// ===== Content =====
	let content: ReactNode;

	if (isLoading) {
		content = (
			<div className={styles.stateBox}>
				<div className={styles.stateTitle}>Loading</div>
				<div className={styles.stateText}>Fetching plans…</div>
				<div className={styles.skeletonRow} />
				<div className={styles.skeletonRow} />
				<div className={styles.skeletonRowSm} />
			</div>
		);
	} else if (error) {
		content = (
			<div className={styles.stateBox}>
				<div className={styles.stateTitle}>Failed to load</div>
				<div className={styles.stateText}>Please retry.</div>
				<button
					type="button"
					className={styles.btn}
					onClick={async () => {
						await refetchPlans();
					}}>
					Retry
				</button>
			</div>
		);
	} else if (!items.length) {
		content = (
			<div className={styles.emptyWrap}>
				<div className={styles.emptyCard}>
					<div className={styles.emptyTitle}>
						{isFilterActive ? "No matches" : "No plans"}
					</div>

					{!collapsed && (
						<div className={styles.emptyText}>
							{isFilterActive ?
								"Try another query or clear the filter."
							:	"Create your first plan to start organizing tasks."}
						</div>
					)}

					{!collapsed && (
						<div className={styles.emptyActions}>
							{isFilterActive ?
								<button
									type="button"
									className={styles.btn}
									onClick={clearFilter}>
									Clear filter
								</button>
							:	<button
									type="button"
									className={styles.btnPrimary}
									onClick={() => setIsCreatePlanOpen(true)}>
									Create plan
								</button>
							}
						</div>
					)}
				</div>
			</div>
		);
	} else {
		content = (
			<ul className={styles.list}>
				{items.map(({ plan, href, isActive }) => {
					const planId = String(plan.id);
					const isMenuOpen = openMenuPlanId === planId;

					return (
						<li key={planId} className={styles.item}>
							<Link
								href={href}
								className={cn(styles.link, isActive && styles.active)}
								aria-current={isActive ? "page" : undefined}
								title={plan.name}>
								<div className={styles.row}>
									<span className={styles.indicator} aria-hidden="true" />

									{!collapsed && (
										<span className={styles.name} title={plan.name}>
											{plan.name}
										</span>
									)}

									{!collapsed && (
										<div
											className={styles.planMenuRoot}
											ref={isMenuOpen ? openMenuRootRef : null}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}>
											<button
												type="button"
												className={styles.planMenuBtn}
												aria-haspopup="menu"
												aria-expanded={isMenuOpen}
												aria-label="Plan actions"
												title="Actions"
												onClick={(ev) => {
													ev.preventDefault();
													ev.stopPropagation();
													setOpenMenuPlanId((prev) =>
														prev === planId ? null : planId,
													);
												}}>
												<span aria-hidden="true">⋯</span>
											</button>

											{isMenuOpen && (
												<div className={styles.planMenu} role="menu">
													<button
														type="button"
														className={styles.planMenuItem}
														role="menuitem"
														onClick={(ev) => {
															ev.preventDefault();
															ev.stopPropagation();
															setOpenMenuPlanId(null);
															onAddTask(planId);
														}}>
														Add task
													</button>

													<button
														type="button"
														className={styles.planMenuItem}
														role="menuitem"
														onClick={(ev) => {
															ev.preventDefault();
															ev.stopPropagation();
															setOpenMenuPlanId(null);
															onEditPlan(planId);
														}}>
														Edit plan
													</button>

													<button
														type="button"
														className={cn(
															styles.planMenuItem,
															styles.planMenuDanger,
														)}
														role="menuitem"
														onClick={async (ev) => {
															ev.preventDefault();
															ev.stopPropagation();
															setOpenMenuPlanId(null);
															await onDeletePlan(planId);
														}}>
														Delete plan
													</button>
												</div>
											)}
										</div>
									)}
								</div>
							</Link>
						</li>
					);
				})}
			</ul>
		);
	}

	const totalPlans = plans?.length ?? 0;

	return (
		<aside
			className={cn(styles.sidebar, collapsed && styles.sidebarCollapsed)}
			aria-label="Plans sidebar"
			data-resizing={isResizing ? "true" : "false"}>
			<header className={styles.header}>
				<div className={styles.headerTop}>
					<div className={styles.brand}>
						<div className={styles.brandMark} aria-hidden="true" />
						{!collapsed && (
							<div className={styles.brandText}>
								<div className={styles.brandTitle}>Plans</div>
								<div className={styles.brandSub}>{totalPlans} total</div>
							</div>
						)}
					</div>

					<button
						type="button"
						className={styles.iconBtn}
						title={collapsed ? "Expand" : "Collapse"}
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						onClick={() => {
							setCollapsed((p) => !p);
							setIsFilterOpen(false);
						}}>
						<span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
					</button>
				</div>

				<div className={styles.actions}>
					<button
						type="button"
						className={styles.actionBtn}
						title="Create plan"
						aria-label="Create plan"
						onClick={() => setIsCreatePlanOpen(true)}>
						{collapsed ? "+" : "Create"}
					</button>

					<button
						type="button"
						className={cn(
							styles.actionBtn,
							isFilterActive && styles.actionBtnActive,
						)}
						title={isFilterActive ? `Filter: ${filterQuery}` : "Filter"}
						aria-label="Filter"
						onClick={openOrFocusFilter}>
						{collapsed ? "F" : "Filter"}
					</button>

					{!collapsed && (
						<button
							type="button"
							className={styles.actionBtn}
							title={sortDir === "asc" ? "Sort A → Z" : "Sort Z → A"}
							aria-label="Sort"
							onClick={() => setSortDir((p) => (p === "asc" ? "desc" : "asc"))}>
							{sortDir === "asc" ? "A–Z" : "Z–A"}
						</button>
					)}

					<button
						type="button"
						className={styles.actionBtn}
						title="Settings"
						aria-label="Settings"
						onClick={() => setIsSettingsOpen(true)}>
						{collapsed ? "S" : "Settings"}
					</button>
				</div>

				{!collapsed && isFilterOpen && (
					<div className={styles.inlineFilter}>
						<input
							ref={filterInputRef}
							className={styles.filterInput}
							value={filterQuery}
							onChange={(e) => setFilterQuery(e.target.value)}
							placeholder="Filter plans…"
						/>

						<button
							type="button"
							className={styles.clearBtn}
							onClick={
								filterQuery.length ? clearFilter : () => setIsFilterOpen(false)
							}
							aria-label={filterQuery.length ? "Clear filter" : "Close filter"}
							title={filterQuery.length ? "Clear" : "Close"}>
							×
						</button>
					</div>
				)}

				<div className={styles.headerDivider} />
			</header>

			<nav className={styles.nav} aria-label="Plans list">
				{content}
			</nav>

			<footer className={styles.footer}>
				{!collapsed ?
					<div className={styles.footerRow}>
						<div className={styles.footerText}>Select a plan to view tasks</div>

						<button
							type="button"
							className={cn(styles.footerBtn, styles.footerBtnDanger)}
							onClick={onLogout}
							aria-label="Log out"
							title="Log out">
							Log out
						</button>
					</div>
				:	<div className={styles.footerCollapsed}>
						<div
							className={styles.footerMini}
							title="Select a plan to view tasks">
							•
						</div>

						<button
							type="button"
							className={cn(styles.footerIconBtn, styles.footerBtnDanger)}
							onClick={onLogout}
							aria-label="Log out"
							title="Log out">
							⎋
						</button>
					</div>
				}
			</footer>

			<div
				className={styles.resizer}
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize sidebar"
				onMouseDown={onResizeStart}
			/>

			{isCreateTaskOpen && activePlanId && (
				<CreateTaskModal
					planId={activePlanId}
					onClose={() => {
						setIsCreateTaskOpen(false);
						setActivePlanId(null);
					}}
				/>
			)}

			{isCreatePlanOpen && (
				<CreatePlanModal
					onClose={() => setIsCreatePlanOpen(false)}
					onCreated={async () => {
						await refetchPlans();
					}}
				/>
			)}

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				onApply={(s) => setSortDir(s.sortPlans)}
			/>
		</aside>
	);
}
