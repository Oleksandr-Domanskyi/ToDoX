import { Providers } from "./providers";
import "./styles/globals.css";
import { Sidebar } from "../shared/ui/sidebar";

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
