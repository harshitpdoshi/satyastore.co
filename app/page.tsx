"use client"

import type React from "react"

import Image from "next/image"
import site from "@/config/site.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapEmbed } from "@/components/map-embed"
import { useEffect, useRef, useState } from "react"
import { Phone, MessageCircle, MapPin, Instagram, Facebook, Youtube, Clock, Mail } from "lucide-react"

type Hours = { days: string; open: string; close: string }

function telHref(e164: string) {
  // RFC 3966 expects tel:+<digits> without spaces
  return `tel:${(e164 || "").replace(/\s+/g, "")}`
}

function waHref(e164: string, text?: string) {
  const base = `https://wa.me/${(e164 || "").replace(/[^\d]/g, "")}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

function upiDeeplink(params: {
  vpa: string
  pn?: string
  am?: string | number
  cu?: string
  tn?: string
  mc?: string
  tr?: string
  url?: string
}) {
  // Minimal set aligned with NPCI UPI linking spec (pa, pn, am, cu, tn, mc, tr, url).
  const q: Record<string, string> = {}
  q.pa = params.vpa
  if (params.pn) q.pn = params.pn
  if (params.am != null) q.am = String(params.am)
  q.cu = params.cu ?? "INR"
  if (params.tn) q.tn = params.tn
  if (params.mc) q.mc = params.mc
  if (params.tr) q.tr = params.tr
  if (params.url) q.url = params.url
  const qs = new URLSearchParams(q).toString()
  return `upi://pay?${qs}`
}

function useOpenNow(hours: Hours[], tz = "Asia/Kolkata") {
  // Simple open/closed indicator using local IST time
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const ist = new Date(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(now)
      .replace(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})/, "$3-$2-$1T$4:$5:00"),
  )

  const day = ist.toLocaleDateString("en-US", { weekday: "short", timeZone: tz })
  const mins = ist.getHours() * 60 + ist.getMinutes()

  const rule = hours.find((h) => {
    // crude ranges like "Mon–Sat" or exact "Sun"
    if (h.days.includes("–")) {
      const [start, end] = h.days.split("–").map((s) => s.trim())
      const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const i = order.indexOf(day.slice(0, 3))
      const a = order.indexOf(start.slice(0, 3))
      const b = order.indexOf(end.slice(0, 3))
      if (i === -1 || a === -1 || b === -1) return false
      return a <= b ? i >= a && i <= b : i >= a || i <= b
    }
    return h.days.startsWith(day.slice(0, 3))
  })

  if (!rule) return { open: false, message: "Hours unavailable" }

  const [oh, om] = rule.open.split(":").map(Number)
  const [ch, cm] = rule.close.split(":").map(Number)
  const openM = oh * 60 + om
  const closeM = ch * 60 + cm

  const open = mins >= openM && mins < closeM
  const message = open ? `Open now · Closes ${rule.close}` : `Closed · Opens ${rule.open} (${rule.days})`

  return { open, message }
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="w-full max-w-screen-md mx-auto px-4 md:px-6">
      {title ? <h2 className="text-xl md:text-2xl font-semibold mb-4 text-balance">{title}</h2> : null}
      {children}
    </section>
  )
}

function Gallery() {
  const ref = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollBy = (dir: "prev" | "next") => {
    const el = ref.current
    if (!el) return
    const delta = dir === "next" ? el.clientWidth * 0.85 : -el.clientWidth * 0.85
    el.scrollBy({ left: delta, behavior: "smooth" })

    // Update current index for accessibility
    const newIndex =
      dir === "next" ? Math.min(currentIndex + 1, site.gallery.length - 1) : Math.max(currentIndex - 1, 0)
    setCurrentIndex(newIndex)
  }

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Store Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div
            ref={ref}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label="Store photo gallery"
          >
            {site.gallery.map((img, i) => (
              <div key={i} className="shrink-0 snap-start first:ml-0 last:mr-0 w-[85%] sm:w-[60%] md:w-[48%]">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 85vw, (max-width: 768px) 60vw, 48vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollBy("prev")}
              aria-label="Previous photo"
              disabled={currentIndex === 0}
            >
              ← Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {site.gallery.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollBy("next")}
              aria-label="Next photo"
              disabled={currentIndex === site.gallery.length - 1}
            >
              Next →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UPIBlock() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Pay by UPI</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48 rounded-lg bg-background border-2 border-dashed border-muted-foreground/20 p-4">
          <Image
            src={site.upi.qrImage || "/placeholder.svg"}
            alt={`UPI QR code for ${site.upi.merchantName}`}
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Secure payments via your UPI app. We don't process or store payment data.
        </div>
      </CardContent>
    </Card>
  )
}

function CTABar() {
  const phone = site.business.phoneE164
  const wa = site.business.whatsappE164
  const maps = site.map.openInMapsUrl

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="rounded-xl shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 p-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button asChild className="flex-1" size="sm">
              <a href={telHref(phone)} aria-label="Call Satya Store">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </a>
            </Button>
            <Button asChild variant="secondary" className="flex-1" size="sm">
              <a
                href={waHref(wa, "Hello Satya Store! I would like to know more about your products.")}
                aria-label="WhatsApp Satya Store"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </a>
            </Button>
            {site.social.instagram && (
              <Button asChild variant="outline" className="flex-1 bg-transparent" size="sm">
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Satya Store on Instagram"
                >
                  <Instagram className="w-4 h-4 mr-1" />
                  Instagram
                </a>
              </Button>
            )}
          </div>
          <Button asChild variant="outline" className="w-full bg-transparent" size="sm">
            <a href={maps} target="_blank" rel="noopener noreferrer" aria-label="Get directions to Satya Store">
              <MapPin className="w-4 h-4 mr-1" />
              Directions
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const { open, message } = useOpenNow(site.business.hours)

  // JSON-LD LocalBusiness structured data
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.business.name,
    image: site.theme.logo ? [site.theme.logo] : undefined,
    telephone: site.business.phoneE164,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.business.address.line1}, ${site.business.address.line2}`,
      addressLocality: site.business.address.city,
      addressRegion: site.business.address.state,
      postalCode: site.business.address.postalCode,
      addressCountry: site.business.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.business.geo.lat,
      longitude: site.business.geo.lng,
    },
    openingHoursSpecification: site.business.hours.map((h: Hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    })),
    url: typeof window !== "undefined" ? window.location.href : undefined,
    sameAs: Object.values(site.social).filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />

      <main className="min-h-screen bg-background text-foreground pb-28">
        {/* Header */}
        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40">
          <div className="mx-auto max-w-screen-md px-4 md:px-6 py-4 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
              <Image
                src={site.theme.logo || "/placeholder.svg"}
                alt="Satya Store logo"
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold leading-tight text-balance">{site.business.name}</h1>
              <p className="text-sm text-muted-foreground">{site.business.tagline}</p>
            </div>
            <Badge variant={open ? "default" : "secondary"} className="shrink-0">
              {open ? "Open" : "Closed"}
            </Badge>
          </div>
        </header>

        <div className="mx-auto max-w-screen-md px-4 md:px-6 py-6 grid gap-8">
          {/* Business Status & About */}
          <Section>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={open ? "text-emerald-600 font-medium" : "text-muted-foreground"}>{message}</span>
              </div>
              <p className="text-base md:text-lg text-pretty leading-relaxed">{site.business.about}</p>
              <div className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  {site.business.address.line1}, {site.business.address.line2}
                  <br />
                  {site.business.address.city}, {site.business.address.state} {site.business.address.postalCode}
                </span>
              </div>
            </div>
          </Section>

          {/* Primary Actions */}
          <Section>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <Button asChild size="lg" className="h-14">
                  <a href={telHref(site.business.phoneE164)} className="flex flex-col items-center gap-1">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">Call</span>
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg" className="h-14">
                  <a
                    href={waHref(
                      site.business.whatsappE164,
                      "Hello Satya Store! I would like to know more about your products.",
                    )}
                    className="flex flex-col items-center gap-1"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">WhatsApp</span>
                  </a>
                </Button>
                {site.social.instagram && (
                  <Button asChild variant="outline" size="lg" className="h-14 bg-transparent">
                    <a
                      href={site.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  </Button>
                )}
              </div>
              <Button asChild variant="outline" size="lg" className="h-14 w-full bg-transparent">
                <a
                  href={site.map.openInMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Directions</span>
                </a>
              </Button>
            </div>
          </Section>

          {/* Social Links */}
          <Section>
            <div className="flex flex-wrap gap-2 justify-center">
              {site.social.instagram && (
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                </Button>
              )}
              {site.social.facebook && (
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                </Button>
              )}
              {site.social.youtube && (
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={site.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                </Button>
              )}
            </div>
          </Section>

          {/* Gallery */}
          <Section title="Our Store">
            <Gallery />
          </Section>

          {/* UPI Payments */}
          <Section title="Quick Payments">
            <UPIBlock />
          </Section>

          {/* Map */}
          <Section title="Visit Us">
            <MapEmbed />
          </Section>

          {/* Contact Details */}
          <Section title="Contact Information">
            <Card className="border-muted">
              <CardContent className="py-6 grid gap-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a
                      className="underline underline-offset-2 hover:text-primary"
                      href={telHref(site.business.phoneE164)}
                    >
                      {site.business.phoneE164}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <a
                      className="underline underline-offset-2 hover:text-primary"
                      href={waHref(site.business.whatsappE164)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {site.business.whatsappE164}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a
                      className="underline underline-offset-2 hover:text-primary"
                      href={`mailto:${site.business.email}`}
                    >
                      {site.business.email}
                    </a>
                  </div>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Business Hours:</span>
                  </div>
                  {site.business.hours.map((h, i) => (
                    <div key={i} className="ml-5">
                      {h.days}: {h.open} – {h.close}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>

        {/* Sticky mobile CTA bar */}
        <CTABar />

        {/* Footer */}
        <footer className="mt-12 border-t bg-muted/30">
          <div className="mx-auto max-w-screen-md px-4 md:px-6 py-6 text-center text-sm text-muted-foreground">
            <p>© 2025 {site.business.name}. All rights reserved.</p>
            <p className="mt-1">Trusted homeware store since 1972</p>
          </div>
        </footer>
      </main>
    </>
  )
}
