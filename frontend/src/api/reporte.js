import client from './client.js'

export const reporteApi = {
  detalle:  (params = {}) => client.get('/reporte/detalle', { params }),
  resumen:  (params = {}) => client.get('/reporte/resumen', { params }),
}
