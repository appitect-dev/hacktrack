import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Theme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HACKTRACK",
  description: "Hackathon team tracker - fuel your code",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get(THEME_COOKIE)?.value as Theme) || "dark";

  return (
    <html lang="en" className={theme}>
      <body className={`${geistMono.variable} font-mono antialiased`}>
        <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
