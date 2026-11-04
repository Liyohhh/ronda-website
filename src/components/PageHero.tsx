import type { ReactNode } from 'react'
import BackButton from './BackButton'
import { Accent, Eyebrow } from './Motion'

// The top of every inner page: an inset light sky card with round corners and navy words (the lighter scheme, 29 Oct
// 2026; a page with a photo keeps a dark fade so its words read), on the page grid; optional back button, a label
// pill, the page title and a short intro. Anything passed as children (a search box, buttons) sits under the intro; the card does not clip, so a search box's suggestions can open below
// it over the page. photo: an image behind the card, darkened so the text reads.
function PageHero({
  title,
  eyebrow,
  intro,
  note,
  back,
  photo,
  center = false,
  children,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  intro?: ReactNode
  note?: ReactNode
  back?: { to: string; label: string }
  photo?: string
  center?: boolean
  children?: ReactNode
}) {
  return (
    <section className="px-3 sm:px-4 pt-1">
      <div className={`relative z-20 rounded-[32px] ${photo ? 'overflow-hidden bg-navy text-white' : 'bg-gradient-to-br from-[#E9F0F8] via-[#F3F6FA] to-[#F2F6FB] text-[#222D52]'}`}>
        {photo && (
          <>
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#18203D]/90 via-[#18203D]/60 to-[#18203D]/40" />
          </>
        )}
        <div className={`wrap relative py-12 md:py-16 ${center ? 'text-center' : ''}`}>
          {back && (
            <div className="mb-8">
              <BackButton to={back.to} label={back.label} onDark={!!photo} />
            </div>
          )}
          {eyebrow && <Eyebrow tone={photo ? 'dark' : 'light'} center={center}>{eyebrow}</Eyebrow>}
          <h1 className={`${eyebrow ? 'mt-5' : ''} max-w-3xl ${center ? 'mx-auto' : ''} [text-wrap:balance] font-display text-[38px] md:text-[60px] leading-[1.05] font-semibold tracking-[-0.01em]`}>
            {typeof title === 'string' ? <Accent text={title} dark={!!photo} /> : title}
          </h1>
          {intro && <p className={`mt-4 max-w-2xl ${center ? 'mx-auto' : ''} text-lg ${photo ? 'text-white/80' : 'text-[#434C5C]'}`}>{intro}</p>}
          {note && <p className={`mt-2 max-w-2xl ${center ? 'mx-auto' : ''} text-sm ${photo ? 'text-white/65' : 'text-[#5B6576]'}`}>{note}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}

export default PageHero
