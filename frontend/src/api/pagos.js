import client from './client.js'

export const pagosApi = {
  listar:    (params = {}) => client.get('/pagos', { params }),
  obtener:   (id)          => client.get(`/pagos/${id}`),
  crear:     (data)        => client.post('/pagos', data),
  actualizar:(id, data)    => client.put(`/pagos/${id}`, data),
  eliminar:  (id)          => client.delete(`/pagos/${id}`),
  generar:   (data)        => client.post('/pagos/generar', data),
}

