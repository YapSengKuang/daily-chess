import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('daily-chess-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m);}m.setAttribute('content',d?'#14110e':'#f4efe4');}catch(e){}`;
const bodyThemeScript = `try{var d=document.documentElement.classList.contains('dark');document.body.classList.toggle('dark',d);document.body.style.colorScheme=d?'dark':'light';}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: bodyThemeScript }} />
        <div className="shell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
