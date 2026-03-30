import client from './client.js'

export const tiposPagoApi = {
  listar:    (params = {}) => client.get('/tipos-pago', { params }),
  obtener:   (id)          => client.get(`/tipos-pago/${id}`),
  crear:     (data)        => client.post('/tipos-pago', data),
  actualizar:(id, data)    => client.put(`/tipos-pago/${id}`, data),
  eliminar:  (id)          => client.delete(`/tipos-pago/${id}`),
}
