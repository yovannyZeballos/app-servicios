import client from './client.js'

export const suscripcionesApi = {
  listar:    ()           => client.get('/suscripciones'),
  crear:     (data)       => client.post('/suscripciones', data),
  actualizar:(id, data)   => client.put(`/suscripciones/${id}`, data),
  eliminar:  (id)         => client.delete(`/suscripciones/${id}`),
}
