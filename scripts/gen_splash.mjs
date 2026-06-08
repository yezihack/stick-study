/**
 * Regenerate Android splash screens from public/logo.svg.
 *
 * The default Capacitor scaffold drops placeholder splash images (white bg +
 * blue Capacitor logo) into every android/app/src/main/res/drawable-* dir.
 * `npm run apk` (build -> cap sync -> gradle) never regenerates these, so they
 * stay as placeholders. Run this script to render the app logo centered on the
 * paper-cream background (#f4f0e8) at each existing splash size.
 *
 * Usage: node scripts/gen_splash.mjs
 */
import sharp from 'sharp'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const RES = join(ROOT, 'android', 'app', 'src', 'main', 'res')
const LOGO = join(ROOT, 'public', 'logo.svg')

// #f4f0e8 — matches --paper and the launcher background color
const BG = { r: 0xf4, g: 0xf0, b: 0xe8, alpha: 1 }
// logo occupies 40% of the splash's shorter edge
const LOGO_RATIO = 0.4

async function main() {
  const logoSvg = readFileSync(LOGO)
  let count = 0

  for (const dir of readdirSync(RES)) {
    if (!dir.startsWith('drawable')) continue
    const out = join(RES, dir, 'splash.png')
    if (!existsSync(out)) continue

    const { width, height } = await sharp(out).metadata()
    const logoSize = Math.round(Math.min(width, height) * LOGO_RATIO)

    const logo = await sharp(logoSvg)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()

    await sharp({ create: { width, height, channels: 4, background: BG } })
      .composite([{ input: logo, gravity: 'center' }])
      .png()
      .toFile(out)

    console.log('wrote', dir, `${width}x${height}`)
    count++
  }

  console.log('total', count)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
