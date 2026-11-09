import type { Metadata } from "next";
import { Source_Serif_4, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = DM_Sans({
  variable: "--font-sans-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raymont Student Portal",
  description:
    "Student accommodation portal for Raymont Residential College — rooms, fees, applications, and residence life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
