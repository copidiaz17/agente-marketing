import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR = path.join(__dirname, 'tmp')

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

const PROMPTS_IMAGEN = {
  'costos-compras': {
    instagram: 'Modern B2B procurement software dashboard on laptop screen, colorful charts, clean minimal office desk, professional photography, bright lighting, --ar 1:1',
    facebook:  'Business team reviewing purchase orders on tablet, construction materials background, professional environment, warm colors, realistic photography',
    linkedin:  'Professional business software interface showing purchase comparison table, clean corporate style, blue and white color scheme, modern office',
  },
  'medicina-ia': {
    instagram: 'Doctor using AI medical app on tablet, holographic medical data visualization, modern hospital, blue glowing interface, professional photography --ar 1:1',
    facebook:  'Physician reviewing patient records with AI assistant on screen, modern clinic, warm professional lighting, realistic photography',
    linkedin:  'Medical professional with digital health records and AI diagnostic interface, clean hospital environment, blue and white corporate style',
  },
}

export async function generarImagen(productoId, redId) {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('STABILITY_API_KEY no configurada')

  const prompt = PROMPTS_IMAGEN[productoId]?.[redId]
  if (!prompt) throw new Error(`Sin prompt para ${productoId}/${redId}`)

  const response = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      text_prompts: [
        { text: prompt, weight: 1 },
        { text: 'blurry, low quality, watermark, text, logo', weight: -1 },
      ],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )

  const base64 = response.data.artifacts[0].base64
  const filePath = path.join(TMP_DIR, `${productoId}-${redId}-${Date.now()}.png`)
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
  return filePath
}

export function limpiarImagenesTemp() {
  const archivos = fs.readdirSync(TMP_DIR)
  for (const archivo of archivos) {
    fs.unlinkSync(path.join(TMP_DIR, archivo))
  }
}
