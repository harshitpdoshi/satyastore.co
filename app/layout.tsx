import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import site from "@/config/site.json"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: `${site.business.name} — ${site.business.tagline}`,
  description: site.business.about,
  keywords: [
    "homeware",
    "kitchen essentials",
    "crockery",
    "bottles",
    "lunch boxes",
    "bathroom accessories",
    "Rajkot",
    "Gujarat",
  ],
  openGraph: {
    title: `${site.business.name} — ${site.business.tagline}`,
    description: site.business.about,
    url: "https://satyastore.example.com",
    siteName: site.business.name,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${site.business.name} - ${site.business.tagline}`,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.business.name} — ${site.business.tagline}`,
    description: site.business.about,
    images: ["/og-image.jpg"],
  },
  generator: "v0.app",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
