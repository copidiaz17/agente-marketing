import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const IMAGENES = {
  'medicina-ia': [
    'consulta1.png',
    'consulta2.png',
    'consulta3.png',
    'consulta4.png',
    'consultaIa1.png',
    'diagnostico medico.png',
    'informa ia2.png',
    'informeia3.png',
    'insforme ia1.png',
    'pacientes-medicinaIa.png',
    'turnos-medicinaia.png',
  ],
  'costos-compras': [],
}

let ultimasUsadas = {}

export function obtenerImagen(productoId) {
  const lista = IMAGENES[productoId]
  if (!lista || lista.length === 0) return null

  // Rotar imágenes para no repetir siempre la misma
  const usadas = ultimasUsadas[productoId] || []
  const disponibles = lista.filter(f => !usadas.includes(f))
  const pool = disponibles.length > 0 ? disponibles : lista

  const archivo = pool[Math.floor(Math.random() * pool.length)]
  ultimasUsadas[productoId] = [...usadas.filter(f => f !== archivo), archivo].slice(-3)

  const rutaCompleta = path.join(__dirname, 'imagenes', archivo)
  return fs.existsSync(rutaCompleta) ? rutaCompleta : null
}

export function limpiarImagenesTemp() {
  // No hay temp con imágenes locales
}
