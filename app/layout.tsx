import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "./bootstrap-client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
