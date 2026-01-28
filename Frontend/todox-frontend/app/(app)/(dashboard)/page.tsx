import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("access_token")?.value;

	if (!accessToken) {
		redirect("/login?next=/dashboard");
	}

	return <h1>Dashboard (authenticated)</h1>;
}
