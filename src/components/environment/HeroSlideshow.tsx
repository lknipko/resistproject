'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const IMAGES = [
  { src: '/ourhome/hero/canyon.jpg', alt: 'Mesa Arch at sunrise, Canyonlands National Park' },
  { src: '/ourhome/hero/mountain-lake.jpg', alt: 'Snow-capped mountains reflected in an alpine lake' },
  { src: '/ourhome/hero/forest.jpg', alt: 'Pacific Northwest forest at sunset' },
  { src: '/ourhome/hero/meadow.jpg', alt: 'Wildflower meadow at stormy sunset' },
  { src: '/ourhome/hero/ocean.jpg', alt: 'Ocean sunset with birds in flight' },
]

const DISPLAY_MS = 15000
const FADE_MS = 2000

interface HeroSlideshowProps {
  hasActiveIssues: boolean
}

export default function HeroSlideshow({ hasActiveIssues }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    if (mq.matches) return

    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % IMAGES.length)
        setFading(false)
      }, FADE_MS)
    }, DISPLAY_MS)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '480px' }}>
      {/* Image stack */}
      {IMAGES.map((img, i) => {
        const isActive = i === current
        const opacity = reducedMotion
          ? isActive ? 1 : 0
          : isActive
            ? fading ? 0 : 1
            : 0
        return (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
            style={{
              transition: reducedMotion ? 'none' : `opacity ${FADE_MS}ms ease-in-out`,
              opacity,
              zIndex: isActive ? 1 : 0,
            }}
          />
        )
      })}

      {/* Dark gradient overlay for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.15) 100%)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-28" style={{ zIndex: 3 }}>
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-5 leading-none text-white">
            Our Home
          </h1>
          <p className="text-xl text-white/85 leading-relaxed mb-8 max-w-xl">
            This land is your land. The beauty we could never create is being destroyed. You can stop it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ourhome/topics"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-forest-800 font-semibold rounded-lg hover:bg-forest-50 transition-colors text-sm"
            >
              Browse All Topics
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            {hasActiveIssues && (
              <a
                href="#active"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/30 text-white font-semibold rounded-lg hover:bg-black/45 transition-colors border border-white/30 text-sm backdrop-blur-sm"
              >
                Active Issues
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {!reducedMotion && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 3 }}>
          {IMAGES.map((_, i) => (
            <button
              key={i}
              aria-label={`Show image ${i + 1}`}
              onClick={() => { setFading(false); setCurrent(i) }}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                transform: i === current ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
