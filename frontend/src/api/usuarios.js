import client from './client.js'

export const usuariosApi = {
  listar:   (params = {}) => client.get('/usuarios', { params }),
  obtener:  (id)          => client.get(`/usuarios/${id}`),
  crear:    (data)        => client.post('/usuarios', data),
  actualizar: (id, data)  => client.put(`/usuarios/${id}`, data),
  eliminar: (id)          => client.delete(`/usuarios/${id}`),
  cambiarPassword: (data) => client.put('/usuarios/me/password', data),
}
