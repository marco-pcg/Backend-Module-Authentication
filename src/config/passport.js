import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateUser } from "../services/authService.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = process.env;

// Valida se as credenciais do Google foram configuradas antes de
// registrar a estratégia. Isso evita erros confusos mais tarde.
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  console.error(
    "[passport] ERRO: variáveis GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ou " +
      "GOOGLE_CALLBACK_URL não encontradas. Verifique o arquivo .env."
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["openid", "profile", "email"],
    },
    // Callback chamado pelo Passport após o Google autenticar o usuário
    (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName;
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;
        const picture =
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : null;

        const user = findOrCreateUser({ googleId, name, email, picture });

        // done(erro, usuario) -> o usuario fica disponível em req.user
        // dentro da rota de callback (usamos session: false, então isso
        // só vale para a requisição atual, não é persistido em sessão).
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Como não usamos sessão (session: false), não precisamos de
// serializeUser/deserializeUser. Eles só são necessários quando o
// Passport gerencia sessões no servidor.

export default passport;
