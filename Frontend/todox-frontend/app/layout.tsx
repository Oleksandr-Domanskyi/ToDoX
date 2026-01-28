import "../styles/globals.css";
import { Providers } from "./providers";
import { FontAwesomeLoader } from "@/shared/lib/fontawesome/FonstAwasomeLoader";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<Providers>
					<FontAwesomeLoader />
					{children}
				</Providers>
			</body>
		</html>
	);
}
