# Express Google Auth

Projeto didático de **autenticação com Google** usando **Node.js + Express + Passport + Google OAuth 2.0 / OpenID Connect + JWT**.

Ideal para apresentações acadêmicas: o código é simples, organizado em camadas (rotas, controllers, services, middlewares) e não usa banco de dados externo — os usuários são armazenados em um array em memória.

---

## 1. O que é o projeto

Uma API Express que permite:

- Login via Google (OAuth 2.0 / OpenID Connect) usando Passport.js
- Criação automática do usuário em uma base em memória no primeiro login
- Geração de um **JWT próprio da aplicação** após o login com o Google
- Uma rota protegida (`/auth/profile`) que só pode ser acessada com um JWT válido

Importante: existem **dois tokens diferentes** envolvidos nesse fluxo (veja a seção 9).

---

## 2. Como instalar

Pré-requisitos: Node.js 18+ instalado.

```bash
# entre na pasta do projeto
cd express-google-auth

# instale as dependências
npm install
```

---

## 3. Como configurar o `.env`

1. Duplique o arquivo `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

2. Preencha as variáveis:

```env
PORT=3000
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
JWT_SECRET=uma_chave_secreta_bem_grande_e_aleatoria
```

- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: obtidos no Google Cloud Console (veja seção 4).
- `GOOGLE_CALLBACK_URL`: deve ser exatamente igual à URI autorizada configurada no Google Cloud Console.
- `JWT_SECRET`: qualquer string longa e aleatória, usada para assinar os JWTs da aplicação. **Nunca compartilhe esse valor.**

O arquivo `.env` já está no `.gitignore` e nunca deve ser commitado com credenciais reais.

---

## 4. Como criar as credenciais do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto (ou selecione um existente).
3. No menu lateral, vá em **APIs e Serviços > Tela de consentimento OAuth**.
   - Escolha o tipo **Externo** (para testes).
   - Preencha nome do app, e-mail de suporte e e-mail de contato do desenvolvedor.
   - Salve e continue (não é necessário publicar o app para testes locais).
4. Vá em **APIs e Serviços > Credenciais**.
5. Clique em **Criar Credenciais > ID do cliente OAuth**.
6. Selecione o tipo de aplicativo **Aplicativo da Web**.
7. Em **URIs de redirecionamento autorizados**, adicione exatamente:

```text
http://localhost:3000/auth/google/callback
```

8. Clique em **Criar**. O Google vai exibir o **Client ID** e o **Client Secret**.
9. Copie esses valores para o seu arquivo `.env`.

> ⚠️ Se a porta do seu servidor não for `3000`, ajuste tanto o `.env` quanto a URI cadastrada no Google Cloud Console para que fiquem idênticas.

---

## 5. Como executar

Modo desenvolvimento (com reinício automático via nodemon):

```bash
npm run dev
```

Modo produção/simples:

```bash
npm start
```

Você verá no terminal:

```text
Servidor rodando em http://localhost:3000
Inicie o login em: http://localhost:3000/auth/google
```

---

## 6. Como realizar o login

1. Com o servidor rodando, abra no navegador:

```text
http://localhost:3000/auth/google
```

2. Você será redirecionado para a tela de login do Google.
3. Faça login com uma conta Google (a mesma que você usou/adicionou como "usuário de teste" na tela de consentimento, caso o app ainda esteja em modo de teste).
4. O Google redireciona de volta para `http://localhost:3000/auth/google/callback`.
5. A API responde em JSON com o token JWT e os dados do usuário, por exemplo:

```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "googleId": "1029384756",
    "name": "Maria Silva",
    "email": "maria@gmail.com",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

6. Copie o valor de `token` para usar no próximo passo.

---

## 7. Como testar `/auth/profile`

A rota `/auth/profile` é protegida: exige um JWT válido no header `Authorization`.

### Usando curl

```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Usando Postman/Insomnia

- Método: `GET`
- URL: `http://localhost:3000/auth/profile`
- Header: `Authorization: Bearer SEU_TOKEN_AQUI`

### Resposta esperada (sucesso)

```json
{
  "message": "Perfil autenticado",
  "user": {
    "sub": 1,
    "googleId": "1029384756",
    "email": "maria@gmail.com",
    "name": "Maria Silva",
    "iat": 1710000000,
    "exp": 1710003600
  }
}
```

### Resposta esperada (token ausente ou inválido)

```json
{
  "message": "Token não fornecido. Envie o header Authorization."
}
```

Com status HTTP `401 Unauthorized`.

---

## 8. Como funciona o fluxo OAuth

```text
1. Usuário acessa GET /auth/google
2. Passport redireciona o usuário para a tela de login do Google
3. Usuário faz login e autoriza o aplicativo
4. Google redireciona para GET /auth/google/callback com um "code"
5. Passport troca esse "code" pelos dados do perfil do usuário
6. A estratégia (config/passport.js) chama authService.findOrCreateUser
7. Se o googleId já existe na base em memória, reutiliza o usuário
   Se não existe, cria um novo usuário
8. authController.googleCallback gera um JWT da aplicação
9. A API responde com o token JWT e os dados do usuário
```

---

## 9. Diferença entre autenticação Google e JWT da aplicação

É comum confundir os dois tokens envolvidos nesse fluxo:

| | Token do Google (OAuth) | JWT da aplicação |
|---|---|---|
| Quem gera | Google | Nossa API (usando `jsonwebtoken`) |
| Para que serve | Provar que o usuário fez login no Google e permitir buscar seu perfil | Provar que o usuário já passou pelo login do Google e autorizar acesso às rotas da nossa API |
| Onde é usado | Apenas internamente, durante a troca do `code` pelo perfil (o Passport cuida disso) | Enviado pelo cliente em toda requisição às rotas protegidas (`Authorization: Bearer`) |
| Quem valida | Google | Nossa própria API, usando `JWT_SECRET` |

Ou seja: o Google autentica **quem é o usuário**; a partir disso, **nossa aplicação** emite seu próprio JWT para controlar o acesso às suas próprias rotas, sem depender do Google a cada requisição.

---

## 10. Estrutura do projeto

```text
express-google-auth/
├── src/
│   ├── config/
│   │   └── passport.js        # Configuração da GoogleStrategy
│   ├── controllers/
│   │   └── authController.js  # Lógica de resposta das rotas de auth
│   ├── middlewares/
│   │   └── authMiddleware.js  # Middleware de validação do JWT
│   ├── routes/
│   │   └── authRoutes.js      # Definição das rotas /auth/*
│   ├── services/
│   │   └── authService.js     # Regras de negócio: usuário e JWT
│   ├── database/
│   │   └── users.js           # Base de usuários em memória
│   └── app.js                 # Ponto de entrada da aplicação
├── .env                       # Variáveis de ambiente (não versionar)
├── .env.example                # Modelo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

Fluxo de responsabilidades:

```text
Route (authRoutes.js)
  ↓
Controller (authController.js)
  ↓
Service (authService.js)
  ↓
Database (users.js)
```

O Passport (`config/passport.js`) cuida exclusivamente da autenticação com o Google. O `authService.js` cuida da lógica de usuário (buscar/criar) e da geração/verificação do JWT.

---

## Resumo do fluxo completo

```text
Usuário
  ↓
GET /auth/google
  ↓
Google (tela de login)
  ↓
GET /auth/google/callback
  ↓
Passport (GoogleStrategy) obtém o perfil
  ↓
authService.findOrCreateUser (usuário criado/reaproveitado)
  ↓
authService.generateToken (JWT da aplicação)
  ↓
Resposta: { token, user }
  ↓
Cliente usa o token em GET /auth/profile (Authorization: Bearer <token>)
  ↓
authMiddleware valida o JWT
  ↓
Perfil autenticado retornado
```
