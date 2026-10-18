import type { ReactNode } from 'react'
import BackButton from './BackButton'
import { Accent, Eyebrow } from './Motion'

// The top of every inner page, in the home page's style: an inset navy card with round corners (like the home hero),
// on the page grid; optional back button, a label pill, the page title and a short intro. Anything passed as children
// (a search box, buttons) sits under the intro. photo: an image behind the card, darkened so the text reads.
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
      <div className="relative overflow-hidden rounded-[32px] bg-navy text-white">
        {photo && (
          <>
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#18203D]/90 via-[#18203D]/60 to-[#18203D]/40" />
          </>
        )}
        <div className={`wrap relative py-12 md:py-16 ${center ? 'text-center' : ''}`}>
          {back && (
            <div className="mb-8">
              <BackButton to={back.to} label={back.label} onDark />
            </div>
          )}
          {eyebrow && <Eyebrow tone="dark" center={center}>{eyebrow}</Eyebrow>}
          <h1 className={`${eyebrow ? 'mt-5' : ''} max-w-3xl ${center ? 'mx-auto' : ''} [text-wrap:balance] font-display text-[38px] md:text-[60px] leading-[1.05] font-semibold tracking-[-0.01em]`}>
            {typeof title === 'string' ? <Accent text={title} dark /> : title}
          </h1>
          {intro && <p className={`mt-4 max-w-2xl ${center ? 'mx-auto' : ''} text-lg text-white/80`}>{intro}</p>}
          {note && <p className={`mt-2 max-w-2xl ${center ? 'mx-auto' : ''} text-sm text-white/65`}>{note}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}

export default PageHero
