import type { TrailPhoto } from '../data/trailPhotos'

// "Author · CC BY-SA 4.0" with links to the Commons file page and the licence
function PhotoCredit({ photo, className = '' }: { photo: TrailPhoto; className?: string }) {
  return (
    <span className={className}>
      <a href={photo.page} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {photo.author}
      </a>
      {' · '}
      {photo.licenseUrl ? (
        <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer license" className="hover:underline">
          {photo.license}
        </a>
      ) : (
        photo.license
      )}
    </span>
  )
}

export default PhotoCredit
