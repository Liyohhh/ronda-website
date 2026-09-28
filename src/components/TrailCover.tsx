import type { Trail } from '../data/trails'
import { CATEGORY_STYLE } from '../data/trailStyles'

// Trail cover: the photo when one exists, otherwise a category-tinted RONDA gradient with an icon
function TrailCover({ trail, className = '' }: { trail: Trail; className?: string }) {
  const style = CATEGORY_STYLE[trail.category]
  if (trail.cover) {
    return <img src={trail.cover} alt="" loading="lazy" className={`w-full h-full object-cover ${className}`} />
  }
  return (
    <div
      aria-hidden="true"
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${style.from} 10%, ${style.to})` }}
    >
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={style.icon} />
      </svg>
    </div>
  )
}

export default TrailCover
