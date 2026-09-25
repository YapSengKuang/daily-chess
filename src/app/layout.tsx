import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth().catch(() => null);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${sans.variable}`}>
        <Providers session={session}>
          <div className="shell">
            <SiteHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
