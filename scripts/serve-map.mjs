// Local development only: serves the Malaysia map file with HTTP range requests (what PMTiles needs), so the
// website can use the real map without Cloudflare. Production serves the same file from Cloudflare R2.
//   node scripts/serve-map.mjs <path to malaysia.pmtiles> [port]      then in .env.local:
//   VITE_MAP_PMTILES_URL=http://localhost:8788/malaysia.pmtiles
// How the file is made: see docs/MAP.md.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
const port = Number(process.argv[3] ?? 8788)
if (!file || !fs.existsSync(file)) {
  console.error('usage: node scripts/serve-map.mjs <malaysia.pmtiles> [port]')
  process.exit(2)
}
const size = fs.statSync(file).size
const name = '/' + path.basename(file)

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Range')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, ETag')
  if (req.method === 'OPTIONS') return res.writeHead(204).end()
  if (req.url?.split('?')[0] !== name) return res.writeHead(404).end('not found')
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('ETag', `"${size}"`)
  const m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? '')
  if (!m) {
    res.writeHead(200, { 'Content-Length': size, 'Content-Type': 'application/octet-stream' })
    return fs.createReadStream(file).pipe(res)
  }
  const start = Number(m[1]), end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1
  if (start >= size || start > end) return res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end()
  res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1, 'Content-Type': 'application/octet-stream' })
  fs.createReadStream(file, { start, end }).pipe(res)
}).listen(port, () => console.log(`map file on http://localhost:${port}${name} (${(size / 1e6).toFixed(0)} MB)`))
