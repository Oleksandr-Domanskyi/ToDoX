import { Sidebar } from "@/shared/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="app_shell">
			<Sidebar />
			<main className="app_main">{children}</main>
		</div>
	);
}
