import client from './client.js'

export const conceptosApi = {
  listar:      (params = {}) => client.get('/conceptos', { params }),
  obtener:     (id)          => client.get(`/conceptos/${id}`),
  crear:       (data)        => client.post('/conceptos', data),
  actualizar:  (id, data)    => client.put(`/conceptos/${id}`, data),
  eliminar:    (id)          => client.delete(`/conceptos/${id}`),
}
