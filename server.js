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

// En Render, necesitamos un servidor HTTP mínimo para que no duerma
import http from 'http'
http.createServer((req, res) => {
  res.writeHead(200)
  res.end('Agente de marketing activo ✓')
}).listen(process.env.PORT || 3000)
