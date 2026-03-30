'use strict';
import passport            from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config              from './env.js';
import { UsuarioModel }    from '../models/usuario.model.js';

passport.use(new GoogleStrategy(
  {
    clientID:     config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL:  config.google.callbackUrl,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email  = profile.emails?.[0]?.value;
      const nombre = profile.displayName ?? profile.emails?.[0]?.value;

      if (!email) {
        return done(new Error('No se pudo obtener el email de Google'), null);
      }

      // Buscar usuario existente
      let usuario = await UsuarioModel.findByEmail(email);

      if (!usuario) {
        // Nuevo usuario → crear como principal (sin contraseña)
        usuario = await UsuarioModel.create({
          nombre,
          email,
          password_hash: null,
          rol:           'principal',
          principal_id:  null,
        });
      }

      if (!usuario.activo) {
        return done(null, false, { message: 'Cuenta desactivada' });
      }

      return done(null, usuario);
    } catch (err) {
      return done(err, null);
    }
  },
));

export default passport;
