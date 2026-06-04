import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://neva-premium.ru"),
  title: {
    default: "NEVA Premium — Velour & Cashmere Suits",
    template: "%s · NEVA Premium",
  },
  description:
    "NEVA Premium — velour and cashmere loungewear suits for women, men and children. Premium quality, free delivery across Russia.",
  openGraph: {
    type: "website",
    siteName: "NEVA Premium",
    title: "NEVA Premium",
    description:
      "Velour and cashmere loungewear suits. Premium quality, free delivery across Russia.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} h-full`}
    >
      <body className="font-sans min-h-full flex flex-col bg-bg text-ink antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
