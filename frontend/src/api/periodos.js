import client from './client.js'

export const periodosApi = {
  listar:         (params = {}) => client.get('/periodos', { params }),
  obtener:        (id)          => client.get(`/periodos/${id}`),
  crear:          (data)        => client.post('/periodos', data),
  cerrar:         (id)          => client.put(`/periodos/${id}/cerrar`),
  generarPagos:   (id)          => client.post(`/periodos/${id}/generar-pagos`),
}
