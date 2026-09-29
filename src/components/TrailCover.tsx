import type { Trail } from '../data/trails'
import { CATEGORY_STYLE } from '../data/trailStyles'
import { TRAIL_PHOTOS } from '../data/trailPhotos'
import Icon from './Icon'

// Trail cover: the photo when one exists, otherwise a category-tinted RONDA gradient with an icon
function TrailCover({ trail, className = '' }: { trail: Trail; className?: string }) {
  const style = CATEGORY_STYLE[trail.category]
  const photo = TRAIL_PHOTOS[trail.slug]
  if (photo) {
    return <img src={photo.src} alt="" loading="lazy" className={`w-full h-full object-cover ${className}`} />
  }
  return (
    <div
      aria-hidden="true"
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${style.from} 10%, ${style.to})` }}
    >
      <Icon name={style.icon} size={56} className="text-white/85" />
    </div>
  )
}

export default TrailCover
