import client from './client.js'

export const authApi = {
  register: (data)         => client.post('/auth/register', data),
  login:    (data)         => client.post('/auth/login', data),
  refresh:  (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  logout:   (refreshToken) => client.post('/auth/logout', { refreshToken }),
  me:       ()             => client.get('/auth/me'),
}
