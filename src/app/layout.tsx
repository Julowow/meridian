import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian — Live Intel Dashboard",
  description: "Real-time news monitoring terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased dark">
      <body className="h-full overflow-hidden font-sans">{children}</body>
    </html>
  );
}
