import axios from 'axios'

export async function enviarWhatsApp(mensaje) {
  const instance = process.env.ULTRAMSG_INSTANCE
  const token    = process.env.ULTRAMSG_TOKEN
  const destino  = process.env.WHATSAPP_DESTINO

  const response = await axios.post(`https://api.ultramsg.com/${instance}/messages/chat`, {
    token,
    to: destino,
    body: mensaje,
  })
  console.log('UltraMsg response:', JSON.stringify(response.data))
}

export function formatearPosts(resultado) {
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const mensajes = []

  for (const { producto, posts } of resultado) {
    // Encabezado del producto
    mensajes.push(`━━━━━━━━━━━━━━━━━━━\n📢 *${producto}*\n📅 ${fecha}\n━━━━━━━━━━━━━━━━━━━`)

    for (const post of posts) {
      const icono = post.redId === 'instagram' ? '📸' : post.redId === 'facebook' ? '👥' : '💼'
      mensajes.push(`${icono} *${post.red}*\n\n${post.texto}`)
    }
  }

  return mensajes
}
