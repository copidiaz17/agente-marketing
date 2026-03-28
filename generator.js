import Anthropic from '@anthropic-ai/sdk'
import { PRODUCTOS } from './productos.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const REDES = [
  {
    id: 'instagram',
    nombre: 'Instagram',
    instrucciones: `Post para Instagram. Máximo 220 palabras. Tono dinámico y visual.
Usá emojis relevantes. Terminá con 8-10 hashtags populares del sector en español e inglés.
Estructura: gancho atractivo en la primera línea → desarrollo → llamada a la acción.`,
  },
  {
    id: 'facebook',
    nombre: 'Facebook',
    instrucciones: `Post para Facebook. Entre 150 y 300 palabras. Tono cercano y conversacional.
Podés usar 2-3 emojis. Terminá con una pregunta para generar interacción o una llamada a la acción clara.
Estructura: historia o problema → solución → beneficio → CTA.`,
  },
  {
    id: 'linkedin',
    nombre: 'LinkedIn',
    instrucciones: `Post para LinkedIn. Entre 200 y 400 palabras. Tono profesional y de autoridad.
Sin emojis exagerados (máximo 2-3 sutiles). Usá saltos de línea para facilitar la lectura.
Estructura: insight o dato llamativo → problema del sector → cómo lo resolvemos → propuesta de valor → CTA profesional.
Terminá con 3-5 hashtags profesionales.`,
  },
]

export async function generarPostsParaProducto(producto) {
  const posts = []

  for (const red of REDES) {
    const prompt = `Sos un experto en marketing digital para productos tecnológicos B2B en Argentina.

PRODUCTO: ${producto.nombre}
DESCRIPCIÓN: ${producto.descripcion}
PÚBLICO OBJETIVO: ${producto.publicoObjetivo}
BENEFICIO PRINCIPAL: ${producto.beneficioPrincipal}
TONO: ${producto.tono}

TAREA: ${red.instrucciones}

Generá UN solo post listo para publicar. No incluyas títulos como "Post:" ni explicaciones. Solo el texto del post.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    posts.push({
      red: red.nombre,
      redId: red.id,
      texto: message.content[0].text.trim(),
    })
  }

  return posts
}

export async function generarTodosLosPosts() {
  const resultado = []

  for (const producto of PRODUCTOS) {
    console.log(`Generando posts para: ${producto.nombre}`)
    const posts = await generarPostsParaProducto(producto)
    resultado.push({ producto: producto.nombre, posts })
  }

  return resultado
}
