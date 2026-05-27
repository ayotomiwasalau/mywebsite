import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { GoogleAnalytics } from '@next/third-parties/google'

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ayotomiwa Salau",
  description: "Data, Cloud, AI, Web",
  openGraph: {
    title: "Ayotomiwa Salau",
    description: "Data, Cloud, AI, Web",
    url: "https://ayotomiwasalau.com",
    type: "website",
    images: [
      {
        url: "https://ayotomiwasalau.com/profile.jpeg",
        width: 800,
        height: 600,
        alt: "blog image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-0S80T1M8T9" />
    </html>
  );
}
