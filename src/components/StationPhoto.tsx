import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import type { TrailPhoto } from '../data/trailPhotos'
import Icon from './Icon'

// A real photo of the platform you board at, under the ride's times in the trip steps, the way map apps show a place by
// picture. Tap it to see it large. No credit on the site (owner, 4 Nov 2026): demo photos, every source is listed in
// docs/PHOTO_SOURCES.md and all are replaced after launch.
function StationPhoto({ photo, station }: { photo: TrailPhoto; station: string }) {
  const { t } = useLanguage()
  const [big, setBig] = useState(false)
  const alt = t('stationPhotoAlt').replace('{station}', station)
  return (
    <>
      <figure className="mt-2 max-w-sm">
        <button
          type="button"
          onClick={() => setBig(true)}
          aria-label={alt}
          className="block w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BD8]"
        >
          <img src={photo.src} alt="" loading="lazy" decoding="async" className="aspect-[2/1] w-full object-cover" />
        </button>
      </figure>
      {big && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setBig(false)}>
          <figure className="relative max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <img src={photo.src} alt={alt} className="max-h-[80vh] w-auto rounded-2xl object-contain" />
            <figcaption className="mt-2 flex items-center justify-between gap-3 text-sm text-white/90">
              <span className="min-w-0 truncate">{alt}</span>
            </figcaption>
            <button
              type="button"
              onClick={() => setBig(false)}
              aria-label={t('closeAria')}
              className="absolute end-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <Icon name="close" size={18} />
            </button>
          </figure>
        </div>
      )}
    </>
  )
}

export default StationPhoto
