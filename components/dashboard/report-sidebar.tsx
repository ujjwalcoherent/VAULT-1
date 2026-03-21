"use client"

import { ShieldCheck, Users, Timer, Target, Award, Quote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CLIENT_LOGOS } from "@/lib/clients"
import { TESTIMONIALS } from "@/lib/testimonials"

export function ReportSidebar() {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-4 max-h-[calc(100vh-2rem)] space-y-6 overflow-y-auto pb-4 pr-1 scrollbar-thin">
        {/* Why Coherent Market Insights */}
        <Card className="overflow-hidden border-accent/20 bg-gradient-to-b from-secondary to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-center font-serif text-base font-bold tracking-wide">
              WHY COHERENT MARKET INSIGHTS?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {[
              { icon: ShieldCheck, value: "85-92%", label: "Proof of Authenticity" },
              { icon: Users, value: "73%+", label: "Client Retention Rate" },
              { icon: Timer, value: "24 Hours", label: "Quick Turn-around" },
              { icon: Target, value: "1200+", label: "Niche Segments" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                  <stat.icon className="size-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Credibility & Certifications */}
        <Card className="overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0e1f38] to-[#0a1a2e] text-white">
          <CardHeader className="pb-3">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Award className="size-4 text-teal-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-300">Certified Excellence</span>
            </div>
            <CardTitle className="text-center font-serif text-base text-white">
              Credibility & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-0">
            {[
              { src: "https://www.coherentmarketinsights.com/images/duns-registerednewupdsma.webp", label: "DUNS", w: 50, h: 44 },
              { src: "https://www.coherentmarketinsights.com/newfootimg/esomar2026.avif", label: "ESOMAR", w: 90, h: 34 },
              { src: "https://www.coherentmarketinsights.com/images/iso-9001--NewUpda.webp", label: "ISO 9001", w: 48, h: 48 },
              { src: "https://www.coherentmarketinsights.com/images/iso-27001--NewUpda.webp", label: "ISO 27001", w: 48, h: 48 },
              { src: "https://www.coherentmarketinsights.com/images/clutupdatednewupdsma.webp", label: "Clutch", w: 80, h: 38 },
              { src: "https://www.coherentmarketinsights.com/images/Trustpilot-27.webp", label: "Trustpilot", w: 90, h: 50 },
            ].map((cert, i) => (
              <div key={i} className="flex flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
                <img src={cert.src} alt={cert.label} width={cert.w} height={cert.h} loading="lazy" className="max-h-12 object-contain" />
                <p className="mt-1.5 text-[9px] font-medium text-slate-500">{cert.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Our Clientele */}
        <Card className="overflow-hidden border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-center font-serif text-base font-bold tracking-wide">
              Our Clientele
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-3 gap-1.5">
              {CLIENT_LOGOS.slice(0, 12).map((file, i) => (
                <div key={i} className="flex items-center justify-center rounded-md border bg-white p-1.5">
                  <img
                    src={`https://www.coherentmarketinsights.com/images/clients/${file}`}
                    alt={file.replace(/\.\w+$/, "").replace(/[_-]/g, " ")}
                    loading="lazy"
                    className="h-7 object-contain"
                  />
                </div>
              ))}
            </div>
            <a
              href="https://www.coherentmarketinsights.com/trusted-by"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md bg-teal-600 px-4 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-teal-700"
            >
              View All Our Clients &rarr;
            </a>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card className="overflow-hidden border-accent/20 bg-gradient-to-b from-secondary to-background">
          <CardHeader className="pb-3">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Quote className="size-4 text-accent" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">What Our Clients Say</span>
            </div>
            <CardTitle className="text-center font-serif text-base font-bold tracking-wide">
              Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent className="relative overflow-hidden pt-0" style={{ height: "600px" }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-secondary to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-background to-transparent" />
            <div className="testimonial-scroll-wrapper">
              <div className="testimonial-scroll">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <div key={i} className="mb-4 rounded-lg border border-accent/10 bg-background/60 p-3">
                    <div className="mb-2 flex items-start gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1">
                        <img
                          src={`https://www.coherentmarketinsights.com/images/testimg/${t.logo}`}
                          alt={t.company}
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-foreground">{t.company}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-[11px] italic leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
