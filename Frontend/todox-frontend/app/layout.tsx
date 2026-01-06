import "../styles/globals.css";


import { Providers } from "./providers";
import { Sidebar } from "../shared/ui/sidebar";
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
          <div className="app_shell">
            <FontAwesomeLoader />
            <Sidebar />
            <main className="app_main">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
