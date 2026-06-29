// Render PWA icons from the brand SVG. Produces:
//   public/icon-180.png  (Apple touch icon — iPhone home screen)
//   public/icon-192.png  (Android / manifest standard)
//   public/icon-512.png  (Splash, large)
//   public/icon-maskable-512.png  (Android adaptive icon — adds safe-area padding)
//   public/apple-touch-icon.png   (alias for /apple-touch-icon.png lookup)
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = fileURLToPath(new URL('.', import.meta.url))
const publicDir = join(here, '..', 'public')

const svg = await readFile(join(publicDir, 'favicon.svg'))

async function emit(filename, size, padPct = 0) {
  const out = join(publicDir, filename)
  await mkdir(dirname(out), { recursive: true })

  if (padPct === 0) {
    await sharp(svg).resize(size, size).png().toFile(out)
  } else {
    // Maskable: paint the brand color full-bleed, then composite a smaller logo.
    const inner = Math.round(size * (1 - padPct * 2))
    const offset = Math.round((size - inner) / 2)
    const logo = await sharp(svg).resize(inner, inner).png().toBuffer()
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0x13, g: 0x88, b: 0x46, alpha: 1 }
      }
    })
      .composite([{ input: logo, top: offset, left: offset }])
      .png()
      .toFile(out)
  }

  process.stdout.write(`  ${filename} (${size}x${size}${padPct ? ' maskable' : ''})\n`)
}

console.log('Rendering PWA icons:')
await emit('icon-180.png', 180)
await emit('icon-192.png', 192)
await emit('icon-512.png', 512)
await emit('icon-maskable-512.png', 512, 0.12)
await emit('apple-touch-icon.png', 180)
console.log('Done.')
