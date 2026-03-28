import dotenv from 'dotenv'
dotenv.config()

import cron from 'node-cron'
import { generarTodosLosPosts } from './generator.js'
import { enviarWhatsApp, formatearPosts } from './whatsapp.js'

async function ejecutarAgente() {
  console.log(`[${new Date().toISOString()}] Iniciando generación de posts...`)

  try {
    const resultado = await generarTodosLosPosts()
    const mensajes  = formatearPosts(resultado)

    console.log(`Enviando ${mensajes.length} mensajes por WhatsApp...`)

    for (const msg of mensajes) {
      await enviarWhatsApp(msg)
      // Pequeña pausa entre mensajes para no saturar
      await new Promise(r => setTimeout(r, 1500))
    }

    console.log(`[${new Date().toISOString()}] Posts enviados exitosamente.`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message)
  }
}

// Corre cada 3 días a las 9:00 AM (días 1, 4, 7, 10, 13, 16, 19, 22, 25, 28)
// Cron: minuto hora día-del-mes mes día-semana
cron.schedule('0 9 1,4,7,10,13,16,19,22,25,28 * *', () => {
  ejecutarAgente()
})

console.log('🤖 Agente de marketing iniciado. Próxima ejecución: día 1, 4, 7... del mes a las 9:00 hs.')

// Servidor HTTP — health check + trigger manual
import http from 'http'

let corriendo = false

http.createServer(async (req, res) => {
  // Test WhatsApp directo
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
    res.end(JSON.stringify({ ok: true, mensaje: 'Agente iniciado. Posts llegarán en ~1 minuto por WhatsApp.' }))
    corriendo = true
    await ejecutarAgente()
    corriendo = false
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Agente de marketing activo ✓\nPOST /disparar para ejecutar manualmente.')
}).listen(process.env.PORT || 3000)
