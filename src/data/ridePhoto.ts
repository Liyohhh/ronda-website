import { platformPhoto } from './platformPhotos'
import { stationPhoto } from './stationPhotos'

// The photo beside a rail ride in the trip steps: the platform sign for the ride's direction where we have one,
// otherwise the station's photo
export const ridePhoto = (feedId?: string, stopId?: string, headsign?: string | null) =>
  platformPhoto(feedId, stopId, headsign) ?? stationPhoto(feedId, stopId)
