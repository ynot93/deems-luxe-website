// Temporary: builds wordmark images from the logo PNG until the vector files are added.
// Also prints the logo's colours so the design tokens can be checked against them.
import sharp from 'sharp'

const source = 'design/reference/logo-source.png'
const image = sharp(source)
const { width, height, hasAlpha } = await image.metadata()
console.log({ width, height, hasAlpha })

const scale = width / 1932
const sample = async (name, x, y) => {
  const { data, info } = await sharp(source)
    .extract({
      left: Math.round(x * scale),
      top: Math.round(y * scale),
      width: 40,
      height: 40,
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const channels = [0, 1, 2].map((offset) => {
    let total = 0
    for (let i = offset; i < data.length; i += info.channels) total += data[i]
    return Math.round(total / (data.length / info.channels))
  })
  console.log(name, `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`)
}
await sample('mark purple', 760, 1100)
await sample('mark gold', 1100, 800)

// Wordmark lines only, cut below the mark
const wordmark = await sharp(source)
  .extract({
    left: Math.round(200 * scale),
    top: Math.round(1270 * scale),
    width: Math.round(1530 * scale),
    height: Math.round(340 * scale),
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { data, info } = wordmark
const reversed = Buffer.from(data)
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  // White background fades to transparent, in case the source has no real alpha
  const distance = Math.max(255 - r, 255 - g, 255 - b)
  const alpha = Math.min(data[i + 3], Math.min(255, distance * 2))
  data[i + 3] = alpha
  reversed[i + 3] = alpha
  // Blue-dominant pixels are the purple letters: make them white on dark backgrounds
  if (b > r && b > g) {
    reversed[i] = 255
    reversed[i + 1] = 255
    reversed[i + 2] = 255
  }
}

const raw = { raw: { width: info.width, height: info.height, channels: 4 } }
for (const [buffer, name] of [
  [data, 'wordmark'],
  [reversed, 'wordmark-reversed'],
]) {
  await sharp(buffer, raw)
    .trim()
    .resize({ width: 720 })
    .png({ compressionLevel: 9, palette: true })
    .toFile(`public/brand/${name}.png`)
  console.log(`public/brand/${name}.png`)
}
