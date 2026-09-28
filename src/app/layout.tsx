import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Daily Chess",
  description: "One Lichess puzzle a day. Three to six moves. Share your streak.",
  openGraph: {
    title: "Daily Chess",
    description: "One Lichess puzzle a day. Three to six moves. Share your streak.",
    type: "website",
  },
};

const themeScript = `try{var t=localStorage.getItem('daily-chess-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;else if(window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark';}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="shell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
