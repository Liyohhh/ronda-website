import { supabase } from './supabase'

// Profile pictures: shrunk in the browser to a 256 px square WebP (centre crop), uploaded to the public "avatars"
// bucket at <user id>/avatar.webp (only the user can write their own folder), and linked from the user's
// user_metadata.avatar_url (the header shows it). Removing deletes the file and the link.

export const AVATAR_SIZE = 256
export const AVATAR_MAX_INPUT = 10 * 1024 * 1024 // bytes: bigger photos are refused before reading them
const BUCKET = 'avatars'

export const avatarPath = (userId: string) => `${userId}/avatar.webp`

// the centred square to cut from a w x h picture
export function centreSquare(w: number, h: number) {
  const side = Math.min(w, h)
  return { sx: Math.floor((w - side) / 2), sy: Math.floor((h - side) / 2), side }
}

async function squareWebp(file: File): Promise<Blob> {
  const img = await createImageBitmap(file)
  const { sx, sy, side } = centreSquare(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = AVATAR_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no canvas')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
  img.close()
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/webp', 0.85))
  if (!blob) throw new Error('could not encode')
  return blob
}

// returns the new picture's address (with a version so browsers drop the old one)
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const blob = await squareWebp(file)
  const { error } = await supabase.storage.from(BUCKET).upload(avatarPath(userId), blob, { upsert: true, contentType: 'image/webp', cacheControl: '3600' })
  if (error) throw error
  const url = `${supabase.storage.from(BUCKET).getPublicUrl(avatarPath(userId)).data.publicUrl}?v=${Date.now()}`
  const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: url } })
  if (metaErr) throw metaErr
  return url
}

export async function removeAvatar(userId: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([avatarPath(userId)])
  if (error) throw error
  const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: null } })
  if (metaErr) throw metaErr
}
