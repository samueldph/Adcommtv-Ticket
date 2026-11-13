import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdcommTV DevDesk",
  description: "Salesforce projects, requests & development tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
