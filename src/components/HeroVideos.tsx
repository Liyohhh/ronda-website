import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { HERO_SLIDE_MS, HERO_VIDEOS } from '../data/heroVideos'

// Home hero videos (wider screens, motion allowed): the videos play one after another and fade into each other. On the
// top right a row of slim bars works as the slide control: the current one is longer and gold.
// Only the showing video and the next one are loaded, so the page does not fetch all of them at once.
// Under the videos the KL skyline photo stays as the first picture (Home renders it), so nothing jumps while loading.
function HeroVideos() {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const n = HERO_VIDEOS.length
  const refs = useRef<(HTMLVideoElement | null)[]>([])

  // next video after a while; picking a station restarts the wait
  useEffect(() => {
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % n), HERO_SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [index, n])

  // the showing video starts from its beginning
  useEffect(() => {
    const v = refs.current[index]
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }, [index])

  const v = HERO_VIDEOS[index]
  return (
    <>
      <div className="absolute inset-0 hero-settle" aria-hidden="true">
        {HERO_VIDEOS.map((h, i) => {
          const near = i === index || i === (index + 1) % n
          if (!near) return null
          return (
            <video
              key={h.src}
              ref={(el) => { refs.current[i] = el }}
              src={h.src}
              poster={h.poster}
              muted
              loop
              playsInline
              autoPlay={i === index}
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
            />
          )
        })}
      </div>

      {/* the slide control: slim bars, the current one longer and gold */}
      <div className="hidden md:flex absolute end-8 xl:end-16 top-8 z-10 items-center gap-1.5">
        {HERO_VIDEOS.map((h, i) => (
          <button
            key={h.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${t('goToSlide').replace('{n}', String(i + 1))}: ${h.alt}`}
            aria-current={i === index}
            className="group h-6 flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            <span className={`block h-1 rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-gold' : 'w-5 bg-white/45 group-hover:bg-white'}`} />
          </button>
        ))}
      </div>

      <a
        href={v.page}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 end-5 z-10 rounded-full bg-black/35 px-2.5 py-0.5 text-[10px] text-white/80 backdrop-blur-sm hover:underline md:bottom-auto md:top-16 md:end-8 xl:end-16"
      >
        {t('videoLabel')}: {v.author ? `${v.author} · ` : ''}Pexels
      </a>
    </>
  )
}

export default HeroVideos
