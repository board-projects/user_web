import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeQuizMa",
  description: "Draw, collaborate, and share your designs in real-time with your team. Invite anyone with a link and start designing together!",
  icons: {
    icon: "public/favicon-96x96.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
