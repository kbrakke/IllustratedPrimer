import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from '../components/Header'
import ChatInterface from '@/components/ChatInterface'
import Providers from "@/app/providers"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "A Young Lady's Illustrated Primer",
  description: "A prodapedic endichron",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className={`${geistSans.className} pb-[300px]`}>
        <Providers>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <footer className="fixed bottom-0 left-0 right-0 z-50">
            <ChatInterface />
          </footer>
        </Providers>
      </body>
    </html>
  )
}
