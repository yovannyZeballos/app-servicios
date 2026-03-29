import client from './client.js'

export const clientesApi = {
  listar:      (params = {}) => client.get('/clientes', { params }),
  obtener:     (id, params)  => client.get(`/clientes/${id}`, { params }),
  crear:       (data)        => client.post('/clientes', data),
  actualizar:  (id, data)    => client.put(`/clientes/${id}`, data),
  eliminar:    (id)          => client.delete(`/clientes/${id}`),
}
