import client from './client.js'

export const serviciosApi = {
  listar:     (params = {}) => client.get('/servicios', { params }),
  obtener:    (id)          => client.get(`/servicios/${id}`),
  crear:      (data)        => client.post('/servicios', data),
  actualizar: (id, data)    => client.put(`/servicios/${id}`, data),
  eliminar:   (id)          => client.delete(`/servicios/${id}`),
}
