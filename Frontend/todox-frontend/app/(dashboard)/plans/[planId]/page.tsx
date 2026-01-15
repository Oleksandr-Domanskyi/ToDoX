"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { usePlanById } from "@/features/plans/api/plans.queries";
import { useTasksByPlan } from "@/features/tasks/api/tasks.queries";

import { UpdateTaskModal } from "@/features/tasks/ui/UpdateTaskModal";
import { CreateTaskModal } from "@/features/tasks/ui/CreateTaskModal";

import { TaskBlock } from "@/shared/ui/task-block";
import type { Task } from "@/features/tasks/model/tasks.types";
import type { Block, BlockPosition } from "@/shared/types/block";

import styles from "../../../../styles/PlanPage.module.css";

import { deleteTask } from "@/features/tasks/api/task.api";
import { deletePlan, editPlan } from "@/features/plans/api/plans.api";

// ===== Тип Plan =====
type Id = string;

export interface Plan {
	id: Id;
	name: string;
	description: string;
	createdAt: string;
	updatedAt?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readNumber(v: unknown, fallback: number): number {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string") {
		const s = v.trim();
		if (!s) return fallback;
		const n = Number(s);
		return Number.isFinite(n) ? n : fallback;
	}
	return fallback;
}

function toBlockPosition(v: unknown): BlockPosition {
	if (typeof v === "number" && Number.isFinite(v)) {
		if (v === 0) return "left";
		if (v === 1) return "right";
		if (v === 2) return "full";
		return "full";
	}
	if (typeof v !== "string") return "full";
	const s = v.trim().toLowerCase();

	if (s === "left" || s === "l" || s === "0") return "left";
	if (s === "right" || s === "r" || s === "1") return "right";
	if (s === "full" || s === "f" || s === "2") return "full";

	if (s.includes("left")) return "left";
	if (s.includes("right")) return "right";
	if (s.includes("full")) return "full";

	return "full";
}

function getProp(obj: Record<string, unknown>, ...keys: string[]) {
	for (const k of keys) if (k in obj) return obj[k];
	return undefined;
}

/**
 * Row ASC -> Position(left,right,full) -> order ASC -> idx
 */
function sortBlocksByLayout(blocks: Block[]): Block[] {
	const posRank = (p: BlockPosition) =>
		p === "left" ? 0 : p === "right" ? 1 : 2;

	return blocks
		.map((b, idx) => {
			const base = isRecord(b) ? (b as unknown as Record<string, unknown>) : {};
			const Row = readNumber(getProp(base, "Row", "row"), 0);
			const Position = toBlockPosition(getProp(base, "Position", "position"));
			const order = readNumber(
				getProp(base, "order", "Order"),
				Number.MAX_SAFE_INTEGER
			);
			return { b, idx, Row, Position, order };
		})
		.sort((a, c) => {
			if (a.Row !== c.Row) return a.Row - c.Row;

			const prA = posRank(a.Position);
			const prC = posRank(c.Position);
			if (prA !== prC) return prA - prC;

			if (a.order !== c.order) return a.order - c.order;

			return a.idx - c.idx;
		})
		.map((x) => x.b);
}

function safeTime(v?: string) {
	const t = v ? new Date(v).getTime() : 0;
	return Number.isFinite(t) ? t : 0;
}

function taskHaystack(task: Task): string {
	const title = task.title ?? "";
	const blocks = Array.isArray(task.blocks) ? (task.blocks as Block[]) : [];

	const blocksText = blocks
		.map((b) => {
			if (!isRecord(b)) return "";
			const maybeText = [
				getProp(b, "text"),
				getProp(b, "content"),
				getProp(b, "value"),
				getProp(b, "title"),
			]
				.filter((x) => typeof x === "string")
				.join(" ");
			return maybeText;
		})
		.join(" ");

	return `${title} ${blocksText}`.toLowerCase();
}

type SortMode = "newest" | "oldest" | "updated";

export default function PlanPage() {
	const { planId } = useParams<{ planId: string }>();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [isDeletingPlan, setIsDeletingPlan] = useState(false);

	const { data: plan, refetch: refetchPlan } = usePlanById(planId, {
		enabled: !!planId && !isDeletingPlan,
		retry: false,
	});

	const { data: tasks, refetch: refetchTasks } = useTasksByPlan(planId, {
		enabled: !!planId && !isDeletingPlan,
		retry: false,
	});

	const safeTasks = useMemo(() => tasks ?? [], [tasks]);

	// ===== Modals / editors =====
	const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

	// ===== UI modes =====
	const FOCUS_STORAGE_KEY = "plan-focus-mode";
	const READING_STORAGE_KEY = "plan-reading-mode";

	const [focusMode, setFocusMode] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		try {
			return window.localStorage.getItem(FOCUS_STORAGE_KEY) === "1";
		} catch {
			return false;
		}
	});

	const [readingMode, setReadingMode] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		try {
			return window.localStorage.getItem(READING_STORAGE_KEY) === "1";
		} catch {
			return false;
		}
	});

	const toggleFocusMode = () => {
		setFocusMode((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(FOCUS_STORAGE_KEY, next ? "1" : "0");
			} catch {}
			return next;
		});
	};

	const toggleReadingMode = () => {
		setReadingMode((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(READING_STORAGE_KEY, next ? "1" : "0");
			} catch {}
			return next;
		});
	};

	// ===== Collapsing =====
	const [collapsedTaskIds, setCollapsedTaskIds] = useState<
		Record<string, boolean>
	>({});

	const toggleTaskCollapsed = (taskId: string) => {
		setCollapsedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
	};

	const collapseAll = (value: boolean) => {
		const next: Record<string, boolean> = {};
		for (const t of safeTasks) next[t.id] = value;
		setCollapsedTaskIds(next);
	};

	// ===== Stats =====
	const totalCount = safeTasks.length;
	const updatedCount = useMemo(
		() => safeTasks.filter((t) => Boolean(t.updatedAt)).length,
		[safeTasks]
	);

	const lastUpdatedLabel = useMemo(() => {
		const best = [...safeTasks]
			.map((t) => safeTime(t.updatedAt) || safeTime(t.createdAt))
			.sort((a, b) => b - a)[0];

		if (!best) return "—";
		return new Date(best).toLocaleString();
	}, [safeTasks]);

	const progressPct = useMemo(() => {
		if (!totalCount) return 0;
		return Math.round((updatedCount / totalCount) * 100);
	}, [totalCount, updatedCount]);

	// ===== Filters / sort / search =====
	const [query, setQuery] = useState("");
	const [onlyUpdated, setOnlyUpdated] = useState(false);
	const [sortMode, setSortMode] = useState<SortMode>("updated");

	const searchRef = useRef<HTMLInputElement | null>(null);

	const filteredTasks = useMemo(() => {
		const q = query.trim().toLowerCase();

		let list = safeTasks;

		if (onlyUpdated) list = list.filter((t) => Boolean(t.updatedAt));

		if (q) list = list.filter((t) => taskHaystack(t).includes(q));

		const byCreatedAsc = (a: Task, b: Task) =>
			safeTime(a.createdAt) - safeTime(b.createdAt);

		const byCreatedDesc = (a: Task, b: Task) =>
			safeTime(b.createdAt) - safeTime(a.createdAt);

		const byUpdatedDesc = (a: Task, b: Task) => {
			const ta = safeTime(a.updatedAt) || safeTime(a.createdAt);
			const tb = safeTime(b.updatedAt) || safeTime(b.createdAt);
			return tb - ta;
		};

		if (sortMode === "newest") return [...list].sort(byCreatedDesc);
		if (sortMode === "oldest") return [...list].sort(byCreatedAsc);
		return [...list].sort(byUpdatedDesc);
	}, [safeTasks, query, onlyUpdated, sortMode]);

	// ===== Plan menu + inline editor =====
	const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
	const planMenuRootRef = useRef<HTMLDivElement | null>(null);

	const [isEditingPlan, setIsEditingPlan] = useState(false);
	const [planNameDraft, setPlanNameDraft] = useState("");
	const [planDescDraft, setPlanDescDraft] = useState("");
	const [isPlanSaving, setIsPlanSaving] = useState(false);

	useEffect(() => {
		if (!plan) return;
		setPlanNameDraft((plan as Plan).name ?? "");
		setPlanDescDraft((plan as Plan).description ?? "");
	}, [plan]);

	const openPlanEditor = () => {
		if (!plan) return;
		setPlanNameDraft((plan as Plan).name ?? "");
		setPlanDescDraft((plan as Plan).description ?? "");
		setIsEditingPlan(true);
	};

	const closePlanEditor = () => {
		if (!plan) return;
		setPlanNameDraft((plan as Plan).name ?? "");
		setPlanDescDraft((plan as Plan).description ?? "");
		setIsEditingPlan(false);
	};

	const onSavePlan = async () => {
		if (!plan) return;

		const nextName = planNameDraft.trim();
		const nextDesc = planDescDraft.trim();
		if (!nextName) return;

		try {
			setIsPlanSaving(true);

			const payload: Plan = {
				...(plan as Plan),
				name: nextName,
				description: nextDesc,
			};

			await editPlan(payload);
			await refetchPlan();
			setIsEditingPlan(false);
		} catch (e) {
			console.error("Failed to edit plan", e);
		} finally {
			setIsPlanSaving(false);
		}
	};

	const onDeletePlan = async () => {
		try {
			setIsDeletingPlan(true);

			setIsPlanMenuOpen(false);
			setIsEditingPlan(false);

			await queryClient.cancelQueries({ queryKey: ["plan", planId] });
			await queryClient.cancelQueries({ queryKey: ["tasks", planId] });

			await deletePlan(planId);

			queryClient.removeQueries({ queryKey: ["plan", planId] });
			queryClient.removeQueries({ queryKey: ["tasks", planId] });
			queryClient.invalidateQueries({ queryKey: ["plans"] });

			router.replace("/plans");
		} catch (e) {
			console.error("Failed to delete plan", e);
		} finally {
			setIsDeletingPlan(false);
		}
	};

	// outside click close plan menu (ОК: тут capture можно, потому что меню НЕ портальное и внутри ref)
	useEffect(() => {
		if (!isPlanMenuOpen) return;

		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (!target) return;
			if (
				planMenuRootRef.current &&
				!planMenuRootRef.current.contains(target)
			) {
				setIsPlanMenuOpen(false);
			}
		};

		window.addEventListener("pointerdown", onPointerDown, { capture: true });
		return () =>
			window.removeEventListener("pointerdown", onPointerDown, {
				capture: true,
			});
	}, [isPlanMenuOpen]);

	// ===== Task menu (PORTAL) =====
	const [openTaskMenuId, setOpenTaskMenuId] = useState<string | null>(null);
	const [taskMenuPos, setTaskMenuPos] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const taskMenuPortalRef = useRef<HTMLDivElement | null>(null);

	const closeTaskMenu = () => {
		setOpenTaskMenuId(null);
		setTaskMenuPos(null);
	};

	// FIX: закрываем ТОЛЬКО если кликнули ВНЕ портального меню
	useEffect(() => {
		if (!openTaskMenuId) return;

		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (!target) return;

			// если клик внутри меню — НЕ закрываем
			if (taskMenuPortalRef.current?.contains(target)) return;

			closeTaskMenu();
		};

		window.addEventListener("pointerdown", onPointerDown, { capture: true });
		return () =>
			window.removeEventListener("pointerdown", onPointerDown, {
				capture: true,
			});
	}, [openTaskMenuId]);

	// ===== Active task highlight =====
	const taskRefs = useRef<Record<string, HTMLLIElement | null>>({});
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (!filteredTasks.length) return;

		const elements = filteredTasks
			.map((t) => taskRefs.current[t.id])
			.filter((el): el is HTMLLIElement => Boolean(el));

		if (!elements.length) return;

		const io = new IntersectionObserver(
			(entries) => {
				let best: { id: string; ratio: number } | null = null;

				for (const e of entries) {
					const id = (e.target as HTMLElement).dataset["taskid"];
					if (!id) continue;

					const ratio = e.intersectionRatio ?? 0;
					if (!best || ratio > best.ratio) best = { id, ratio };
				}

				if (best && best.ratio > 0) setActiveId(best.id);
			},
			{ threshold: [0.25, 0.5, 0.7] }
		);

		for (const el of elements) io.observe(el);
		return () => io.disconnect();
	}, [filteredTasks]);

	const deleteTaskHandler = async (
		pId: string,
		tId: string,
		onSuccess?: () => void
	) => {
		try {
			await deleteTask(pId, tId);
			onSuccess?.();
		} catch (error) {
			console.error("deleteTask failed", error);
		}
	};

	// ===== Hotkeys =====
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				closeTaskMenu();
				setIsPlanMenuOpen(false);
				(searchRef.current as HTMLInputElement | null)?.blur();
			}

			if (
				e.key === "/" &&
				!(e.target instanceof HTMLInputElement) &&
				!(e.target instanceof HTMLTextAreaElement)
			) {
				e.preventDefault();
				searchRef.current?.focus();
			}

			if (
				e.key.toLowerCase() === "c" &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey
			) {
				if (
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement
				)
					return;

				const allCollapsed =
					safeTasks.length > 0 &&
					safeTasks.every((t) => collapsedTaskIds[t.id]);
				collapseAll(!allCollapsed);
			}

			if (
				e.key.toLowerCase() === "r" &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey
			) {
				if (
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement
				)
					return;
				toggleReadingMode();
			}

			if (
				e.key.toLowerCase() === "f" &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey
			) {
				if (
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement
				)
					return;
				toggleFocusMode();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeTasks, collapsedTaskIds, readingMode, focusMode]);

	return (
		<div
			className={[
				styles.shell,
				focusMode ? styles.shellFocus : "",
				readingMode ? styles.shellReading : "",
			].join(" ")}>
			<div className={styles.backdrop} aria-hidden="true" />

			<main className={styles.main}>
				<div className={styles.page}>
					<header className={styles.header}>
						<div className={styles.headerTop}>
							<div className={styles.headerTitleArea}>
								<h1 className={styles.title}>
									{isEditingPlan
										? planNameDraft
										: (plan as Plan | undefined)?.name}
								</h1>

								<div className={styles.submeta}>
									{(plan as Plan | undefined) ? (
										<>
											<span className={styles.metaChip}>
												Created{" "}
												{new Date(
													(plan as Plan).createdAt
												).toLocaleDateString()}
											</span>
											<span className={styles.metaSep}>•</span>
											<span className={styles.metaChip}>
												Last activity {lastUpdatedLabel}
											</span>
										</>
									) : (
										<span className={styles.metaChip}>Loading…</span>
									)}
								</div>
							</div>

							<div className={styles.headerActions}>
								<button
									type="button"
									className={styles.ghostBtn}
									onClick={toggleReadingMode}
									title={
										readingMode ? "Exit reading mode (R)" : "Reading mode (R)"
									}>
									<i
										className={`fa-solid ${
											readingMode ? "fa-align-left" : "fa-align-justify"
										}`}
										aria-hidden="true"
									/>
									<span>{readingMode ? "Reading" : "Default"}</span>
								</button>

								<button
									type="button"
									className={styles.ghostBtn}
									onClick={toggleFocusMode}
									title={focusMode ? "Exit focus mode (F)" : "Focus mode (F)"}>
									<i
										className={`fa-solid ${
											focusMode ? "fa-compress" : "fa-expand"
										}`}
										aria-hidden="true"
									/>
									<span>{focusMode ? "Focus On" : "Focus Off"}</span>
								</button>

								<div className={styles.menuRoot} ref={planMenuRootRef}>
									<button
										type="button"
										className={styles.iconBtn}
										aria-haspopup="menu"
										aria-expanded={isPlanMenuOpen}
										aria-label="Plan actions"
										title="Actions"
										disabled={isDeletingPlan}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setIsPlanMenuOpen((p) => !p);
										}}>
										<i className="fa-solid fa-ellipsis" aria-hidden="true" />
									</button>

									{isPlanMenuOpen && (
										<div
											className={styles.menu}
											role="menu"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}>
											<button
												type="button"
												className={styles.menuItem}
												role="menuitem"
												disabled={isDeletingPlan}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setIsPlanMenuOpen(false);
													openPlanEditor();
												}}>
												<i
													className="fa-regular fa-pen-to-square"
													aria-hidden="true"
												/>
												<span>Edit plan</span>
											</button>

											<button
												type="button"
												className={`${styles.menuItem} ${styles.menuItemDanger}`}
												role="menuitem"
												disabled={isDeletingPlan}
												onClick={async (e) => {
													e.preventDefault();
													e.stopPropagation();
													setIsPlanMenuOpen(false);
													await onDeletePlan();
												}}>
												<i
													className="fa-regular fa-trash-can"
													aria-hidden="true"
												/>
												<span>
													{isDeletingPlan ? "Deleting…" : "Delete plan"}
												</span>
											</button>
										</div>
									)}
								</div>
							</div>
						</div>

						{!isEditingPlan ? (
							<p className={styles.description}>
								{(plan as Plan | undefined)?.description || ""}
							</p>
						) : null}

						{isEditingPlan ? (
							<div className={styles.inlineEditor}>
								<div className={styles.formRow}>
									<label className={styles.label}>Name</label>
									<input
										className={styles.input}
										value={planNameDraft}
										onChange={(e) => setPlanNameDraft(e.target.value)}
										placeholder="Plan name"
										disabled={isPlanSaving || isDeletingPlan}
									/>
								</div>

								<div className={styles.formRow}>
									<label className={styles.label}>Description</label>
									<textarea
										className={styles.textarea}
										value={planDescDraft}
										onChange={(e) => setPlanDescDraft(e.target.value)}
										placeholder="Plan description"
										rows={4}
										disabled={isPlanSaving || isDeletingPlan}
									/>
								</div>

								<div className={styles.formActions}>
									<button
										type="button"
										className={styles.btn}
										onClick={closePlanEditor}
										disabled={isPlanSaving || isDeletingPlan}>
										Cancel
									</button>

									<button
										type="button"
										className={styles.btnPrimary}
										onClick={onSavePlan}
										disabled={
											isPlanSaving ||
											isDeletingPlan ||
											!planNameDraft.trim().length
										}>
										{isPlanSaving ? "Saving…" : "Save"}
									</button>
								</div>
							</div>
						) : null}
					</header>

					<section className={styles.section}>
						<div className={styles.sectionBar}>
							<div className={styles.sectionTitleRow}>
								<h2 className={styles.sectionTitle}>Tasks</h2>

								<div className={styles.sectionMeta}>
									<span className={styles.kpi}>{totalCount} total</span>
									<span className={styles.kpiSep}>•</span>
									<span className={styles.kpi}>{updatedCount} updated</span>
									<span className={styles.kpiSep}>•</span>
									<span className={styles.kpi}>{progressPct}%</span>
								</div>

								<div className={styles.sectionActions}>
									<button
										type="button"
										className={styles.btnPrimary}
										onClick={() => setIsCreateTaskOpen(true)}
										disabled={isDeletingPlan}
										title="Create task">
										<i className="fa-solid fa-plus" aria-hidden="true" />
										<span>Create</span>
									</button>
								</div>
							</div>

							<div className={styles.controlsRow}>
								<div className={styles.searchWrap}>
									<i
										className="fa-solid fa-magnifying-glass"
										aria-hidden="true"
									/>
									<input
										ref={searchRef}
										className={styles.search}
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder='Search tasks… (press "/")'
										disabled={isDeletingPlan}
									/>
									{query.trim().length > 0 && (
										<button
											type="button"
											className={styles.clearBtn}
											onClick={() => setQuery("")}
											title="Clear">
											<i className="fa-solid fa-xmark" aria-hidden="true" />
										</button>
									)}
								</div>

								<div className={styles.pills}>
									<button
										type="button"
										className={`${styles.pill} ${
											onlyUpdated ? styles.pillOn : ""
										}`}
										onClick={() => setOnlyUpdated((p) => !p)}
										disabled={isDeletingPlan}
										title="Only updated">
										Updated only
									</button>

									<select
										className={styles.select}
										value={sortMode}
										onChange={(e) => setSortMode(e.target.value as SortMode)}
										disabled={isDeletingPlan}
										aria-label="Sort tasks"
										title="Sort">
										<option value="updated">Sort: recent activity</option>
										<option value="newest">Sort: newest</option>
										<option value="oldest">Sort: oldest</option>
									</select>

									<button
										type="button"
										className={styles.pill}
										onClick={() => {
											const allCollapsed =
												safeTasks.length > 0 &&
												safeTasks.every((t) => collapsedTaskIds[t.id]);
											collapseAll(!allCollapsed);
										}}
										disabled={isDeletingPlan || safeTasks.length === 0}
										title="Collapse/Expand all (C)">
										{safeTasks.length > 0 &&
										safeTasks.every((t) => collapsedTaskIds[t.id])
											? "Expand all"
											: "Collapse all"}
									</button>
								</div>
							</div>

							<div className={styles.progressRow} aria-label="Progress">
								<div className={styles.progressTrack}>
									<div
										className={styles.progressFill}
										style={{ width: `${progressPct}%` }}
									/>
								</div>
							</div>
						</div>

						{filteredTasks.length === 0 ? (
							<div className={styles.empty}>
								<div className={styles.emptyTitle}>
									{query.trim() || onlyUpdated ? "No matches" : "No tasks yet"}
								</div>
								<div className={styles.emptyText}>
									{query.trim() || onlyUpdated
										? "Try changing filters or search query."
										: "Create your first task to start building this plan."}
								</div>

								<button
									type="button"
									className={styles.btnPrimary}
									onClick={() => setIsCreateTaskOpen(true)}
									disabled={isDeletingPlan}>
									<i className="fa-solid fa-plus" aria-hidden="true" />
									<span>Create task</span>
								</button>
							</div>
						) : (
							<ul className={styles.list}>
								{filteredTasks.map((task) => {
									const blocks = Array.isArray(task.blocks)
										? (task.blocks as Block[])
										: [];
									const blocksSorted = sortBlocksByLayout(blocks);

									const maxRow = blocksSorted.reduce((m, b) => {
										const base = isRecord(b)
											? (b as unknown as Record<string, unknown>)
											: {};
										const r = readNumber(getProp(base, "Row", "row"), 0);
										return Math.max(m, r);
									}, 0);

									const isEditing = editingTaskId === task.id;
									const isCollapsed = Boolean(collapsedTaskIds[task.id]);
									const isActive = activeId === task.id;

									return (
										<li
											key={task.id}
											className={`${styles.item} ${
												isActive ? styles.itemActive : ""
											}`}
											ref={(node) => {
												taskRefs.current[task.id] = node;
											}}
											data-taskid={task.id}>
											<article className={styles.card}>
												<header className={styles.cardHead}>
													<button
														type="button"
														className={styles.collapseBtn}
														onClick={() => toggleTaskCollapsed(task.id)}
														aria-label={
															isCollapsed ? "Expand task" : "Collapse task"
														}
														title={isCollapsed ? "Expand" : "Collapse"}
														disabled={isDeletingPlan}>
														<i
															className={`fa-solid ${
																isCollapsed
																	? "fa-chevron-right"
																	: "fa-chevron-down"
															}`}
															aria-hidden="true"
														/>
													</button>

													<div className={styles.cardTitleWrap}>
														<div className={styles.cardTitle}>{task.title}</div>
														<div className={styles.cardMeta}>
															<span>
																Created{" "}
																{new Date(task.createdAt).toLocaleString()}
															</span>
															{task.updatedAt ? (
																<>
																	<span className={styles.cardMetaSep}>•</span>
																	<span>
																		Updated{" "}
																		{new Date(task.updatedAt).toLocaleString()}
																	</span>
																</>
															) : null}
														</div>
													</div>

													<div className={styles.cardActions}>
														<button
															type="button"
															className={styles.iconBtn}
															aria-haspopup="menu"
															aria-expanded={openTaskMenuId === task.id}
															aria-label="Task actions"
															title="Actions"
															disabled={isDeletingPlan}
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();

																const rect = (
																	e.currentTarget as HTMLButtonElement
																).getBoundingClientRect();

																const top = rect.bottom + 8;
																const width = 196; // соответствует min-width .menuPortal
																const left = Math.max(12, rect.right - width);

																setTaskMenuPos({ top, left });
																setOpenTaskMenuId((prev) =>
																	prev === task.id ? null : task.id
																);
															}}>
															<i
																className="fa-solid fa-ellipsis"
																aria-hidden="true"
															/>
														</button>

														{openTaskMenuId === task.id && taskMenuPos
															? createPortal(
																	<div
																		ref={taskMenuPortalRef}
																		className={styles.menuPortal}
																		role="menu"
																		style={{
																			top: taskMenuPos.top,
																			left: taskMenuPos.left,
																		}}
																		onPointerDown={(e) => {
																			e.stopPropagation();
																		}}
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																		}}>
																		<button
																			type="button"
																			className={styles.menuItem}
																			role="menuitem"
																			disabled={isDeletingPlan}
																			onClick={(e) => {
																				e.preventDefault();
																				e.stopPropagation();
																				closeTaskMenu();
																				setEditingTaskId((prev) =>
																					prev === task.id ? null : task.id
																				);
																				setCollapsedTaskIds((prev) => ({
																					...prev,
																					[task.id]: false,
																				}));
																			}}>
																			<i
																				className="fa-regular fa-pen-to-square"
																				aria-hidden="true"
																			/>
																			<span>
																				{isEditing
																					? "Close editor"
																					: "Edit task"}
																			</span>
																		</button>

																		<button
																			type="button"
																			className={`${styles.menuItem} ${styles.menuItemDanger}`}
																			role="menuitem"
																			disabled={isDeletingPlan}
																			onClick={async (e) => {
																				e.preventDefault();
																				e.stopPropagation();
																				closeTaskMenu();
																				await deleteTaskHandler(
																					planId,
																					task.id,
																					() => refetchTasks()
																				);
																				if (editingTaskId === task.id)
																					setEditingTaskId(null);
																			}}>
																			<i
																				className="fa-regular fa-trash-can"
																				aria-hidden="true"
																			/>
																			<span>Delete task</span>
																		</button>
																	</div>,
																	document.body
															  )
															: null}
													</div>
												</header>

												{isEditing ? (
													<div className={styles.editorWrap}>
														<UpdateTaskModal
															planId={planId}
															taskId={task.id}
															task={task}
															onSaved={async () => {
																await queryClient.invalidateQueries({
																	queryKey: ["tasks", planId],
																});
																await refetchTasks();
																setEditingTaskId(null);
															}}
														/>
													</div>
												) : null}

												{!isEditing &&
												!isCollapsed &&
												blocksSorted.length > 0 ? (
													<div
														className={styles.blocks}
														style={{
															gridTemplateRows: `repeat(${maxRow + 1}, auto)`,
														}}>
														{blocksSorted.map((block, i) => {
															const base = isRecord(block)
																? (block as unknown as Record<string, unknown>)
																: {};

															const row = readNumber(
																getProp(base, "Row", "row"),
																0
															);
															const pos = toBlockPosition(
																getProp(base, "Position", "position")
															);
															const gridColumn =
																pos === "full"
																	? "1 / -1"
																	: pos === "left"
																	? "1 / 2"
																	: "2 / 3";
															const gridRow = String(row + 1);
															const ord = readNumber(
																getProp(base, "order", "Order"),
																i
															);

															return (
																<div
																	key={`${block.type}_${row}_${pos}_${ord}_${i}`}
																	className={styles.block}
																	style={{ gridColumn, gridRow }}>
																	<TaskBlock block={block} />
																</div>
															);
														})}
													</div>
												) : null}

												{!isEditing && isCollapsed ? (
													<div className={styles.collapsedHint}>
														<span>Collapsed</span>
														<span className={styles.cardMetaSep}>•</span>
														<span>
															{blocksSorted.length
																? `${blocksSorted.length} blocks`
																: "No blocks"}
														</span>
													</div>
												) : null}
											</article>
										</li>
									);
								})}

								<li className={styles.bottomCreateWrap}>
									<button
										type="button"
										className={styles.bottomCreate}
										onClick={() => setIsCreateTaskOpen(true)}
										disabled={isDeletingPlan}>
										<i className="fa-solid fa-plus" aria-hidden="true" />
										<span>Add another task</span>
									</button>
								</li>
							</ul>
						)}

						{isCreateTaskOpen && (
							<CreateTaskModal
								planId={planId}
								onCreated={async () => {
									setIsCreateTaskOpen(false);
									setQuery("");
									setOnlyUpdated(false);
									setSortMode("updated");

									await queryClient.invalidateQueries({
										queryKey: ["tasks", planId],
									});
									await refetchTasks();
								}}
								onClose={() => setIsCreateTaskOpen(false)}
							/>
						)}
					</section>
				</div>
			</main>
		</div>
	);
}
