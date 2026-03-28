import dotenv from 'dotenv'
dotenv.config()

import cron from 'node-cron'
import { generarTodosLosPosts } from './generator.js'
import { enviarWhatsApp, enviarImagenWhatsApp, formatearPosts } from './whatsapp.js'
import { generarImagen, limpiarImagenesTemp } from './images.js'
import { PRODUCTOS } from './productos.js'

async function ejecutarAgente() {
  console.log(`[${new Date().toISOString()}] Iniciando generación de posts e imágenes...`)

  try {
    const resultado = await generarTodosLosPosts()

    for (const { producto, posts } of resultado) {
      const productoInfo = PRODUCTOS.find(p => p.nombre === producto)

      // Encabezado del producto
      const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      await enviarWhatsApp(`━━━━━━━━━━━━━━━━━━━\n📢 *${producto}*\n📅 ${fecha}\n━━━━━━━━━━━━━━━━━━━`)
      await new Promise(r => setTimeout(r, 1500))

      for (const post of posts) {
        const icono = post.redId === 'instagram' ? '📸' : post.redId === 'facebook' ? '👥' : '💼'

        // Intentar generar imagen si hay key de Stability
        if (process.env.STABILITY_API_KEY && productoInfo) {
          try {
            console.log(`Generando imagen para ${productoInfo.id}/${post.redId}...`)
            const imagePath = await generarImagen(productoInfo.id, post.redId)
            await enviarImagenWhatsApp(imagePath, `${icono} *${post.red}*`)
            await new Promise(r => setTimeout(r, 2000))
            // Enviar el texto aparte
            await enviarWhatsApp(post.texto)
          } catch (imgErr) {
            console.error(`Error generando imagen: ${imgErr.message} — enviando solo texto`)
            await enviarWhatsApp(`${icono} *${post.red}*\n\n${post.texto}`)
          }
        } else {
          await enviarWhatsApp(`${icono} *${post.red}*\n\n${post.texto}`)
        }

        await new Promise(r => setTimeout(r, 2000))
      }
    }

    limpiarImagenesTemp()
    console.log(`[${new Date().toISOString()}] Posts enviados exitosamente.`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message)
  }
}

// Corre cada 3 días a las 9:00 AM (días 1, 4, 7, 10, 13, 16, 19, 22, 25, 28)
cron.schedule('0 9 1,4,7,10,13,16,19,22,25,28 * *', () => {
  ejecutarAgente()
})

console.log('🤖 Agente de marketing iniciado. Próxima ejecución: día 1, 4, 7... del mes a las 9:00 hs.')

import http from 'http'

let corriendo = false

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/test-whatsapp') {
    try {
      await enviarWhatsApp('✅ Test desde agente-marketing — WhatsApp funcionando correctamente.')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }

  if (req.method === 'POST' && req.url === '/disparar') {
    if (corriendo) {
      res.writeHead(409, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Ya hay una ejecución en curso' }))
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, mensaje: 'Agente iniciado. Posts e imágenes llegarán en ~3 minutos por WhatsApp.' }))
    corriendo = true
    await ejecutarAgente()
    corriendo = false
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Agente de marketing activo ✓\nPOST /disparar para ejecutar manualmente.')
}).listen(process.env.PORT || 3000)
