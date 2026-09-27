# 🔐 Login Mágico (Magic Link) com Express.js + JWT

Projeto didático e funcional que demonstra um fluxo completo de **autenticação sem senha** (*passwordless authentication*) usando **Magic Link** + **JWT**, construído com **Node.js**, **Express.js** e ES Modules.

Ideal para apresentações, aulas e demonstrações em vídeo: o projeto funciona **mesmo sem um servidor SMTP configurado**, exibindo o link de login diretamente no console do servidor.

---

## 1. O que é Login Mágico (Magic Link)?

É um método de autenticação em que o usuário **não usa senha**. Em vez disso:

1. o usuário informa apenas o seu email;
2. o sistema gera um **link único e temporário**;
3. esse link é enviado por email;
4. ao clicar no link, o usuário é autenticado automaticamente.

Isso elimina a necessidade de armazenar senhas e reduz riscos como reutilização de senha e ataques de força bruta.

Neste projeto, separamos claramente dois conceitos:

| Conceito        | Para que serve                                   | Onde vive                          |
|-----------------|---------------------------------------------------|-------------------------------------|
| **Magic Token** | Autenticar o clique no link (uso único, 10 min)   | Salvo no "banco" em memória do usuário |
| **JWT**         | Autenticar requisições subsequentes na aplicação  | Enviado no header `Authorization`  |

O Magic Token **nunca** é usado como token de sessão da aplicação. Ele serve apenas para provar que o dono do email clicou no link — depois disso, é descartado e um JWT é emitido.

---

## 2. Como o fluxo funciona

```text
Usuário informa o email
        ↓
POST /auth/request-link
        ↓
Backend encontra ou cria o usuário
        ↓
Backend gera um Magic Token (10 min de validade)
        ↓
Backend envia o link por email (ou mostra no console)
        ↓
Usuário clica no link
        ↓
GET /auth/verify?token=...
        ↓
Backend valida o Magic Token (existe? não expirou? não foi usado?)
        ↓
Backend invalida o Magic Token (uso único)
        ↓
Backend gera um JWT da aplicação (validade de 1h)
        ↓
Backend retorna o JWT e os dados do usuário
        ↓
Usuário usa o JWT nas próximas requisições
        ↓
GET /auth/profile
Authorization: Bearer <JWT>
        ↓
Middleware valida o JWT e libera o acesso
```

### Arquitetura interna (camadas)

```text
Route → Controller → Service → "Banco" em memória (users.js)
```

- **Route** (`authRoutes.js`): define os endpoints e liga aos controllers.
- **Controller** (`authController.js`): cuida da comunicação HTTP (request/response, status codes).
- **Service** (`authService.js`): contém a lógica de negócio (gerar/validar Magic Token, gerar/validar JWT).
- **Database** (`users.js`): array em memória simulando uma tabela de usuários.
- **Config** (`mailer.js`): configuração do envio de email via `nodemailer`, com fallback para console.
- **Middleware** (`authMiddleware.js`): protege rotas exigindo um JWT válido.

---

## 3. Como instalar

Pré-requisito: **Node.js 18+** instalado.

```bash
# entre na pasta do projeto
cd express-magic-link

# instale as dependências
npm install
```

---

## 4. Como configurar o `.env`

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` e defina, no mínimo, os segredos usados para assinar os tokens:

```env
PORT=3000

JWT_SECRET=uma_string_secreta_qualquer
MAGIC_LINK_SECRET=outra_string_secreta_qualquer

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

APP_URL=http://localhost:3000
```

> ⚠️ Nunca use `JWT_SECRET` e `MAGIC_LINK_SECRET` de exemplo em produção. Gere strings aleatórias e fortes.

---

## 5. Como configurar SMTP (envio real de email)

Se você quiser que o Magic Link seja realmente **enviado por email**, preencha as variáveis de SMTP no `.env`. Exemplo com Gmail (usando senha de app):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASSWORD=sua_senha_de_app
```

Qualquer provedor SMTP compatível funciona (Mailtrap, SendGrid, Amazon SES, etc.).

---

## 6. Como executar sem SMTP (modo demonstração)

Se as variáveis de SMTP forem deixadas em branco, o projeto **detecta automaticamente** que o SMTP não está configurado e, em vez de enviar o email, **imprime o Magic Link diretamente no console** do servidor:

```text
================================================
MAGIC LINK (modo desenvolvimento - SMTP não configurado)
http://localhost:3000/auth/verify?token=...
================================================
```

Isso permite demonstrar o fluxo completo localmente, sem depender de nenhum serviço externo — ideal para apresentações e vídeos.

---

## 7. Executando o projeto

```bash
# modo desenvolvimento (reinicia automaticamente ao salvar arquivos)
npm run dev

# modo produção/simples
npm start
```

Você verá no console:

```text
Servidor rodando na porta 3000
Acesse: http://localhost:3000
```

---

## 8. Como solicitar o Magic Link

**Requisição:**

```http
POST http://localhost:3000/auth/request-link
Content-Type: application/json

{
  "email": "teste@email.com"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com"}'
```

**Resposta:**

```json
{
  "message": "Se o email estiver correto, um link de acesso foi enviado."
}
```

> O token **nunca** é retornado na resposta da API. Em modo sem SMTP, ele aparece apenas no console do servidor.

---

## 9. Como verificar o Magic Link

Copie o link exibido no console (ou recebido por email) e acesse via navegador, ou:

**cURL:**

```bash
curl "http://localhost:3000/auth/verify?token=SEU_TOKEN_AQUI"
```

**Resposta (sucesso):**

```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "teste@email.com"
  }
}
```

Possíveis erros:

| Situação                  | Status | Mensagem                              |
|----------------------------|--------|----------------------------------------|
| Token não informado        | 400    | "Token não informado."                |
| Token inválido/inexistente | 400    | "Token inválido."                     |
| Token expirado             | 401    | "Token expirado. Solicite um novo link." |

---

## 10. Como utilizar o JWT

O `token` retornado no passo anterior é o **JWT da aplicação**. Ele deve ser enviado no header `Authorization` em todas as rotas protegidas, no formato:

```http
Authorization: Bearer <JWT>
```

O JWT expira em **1 hora**.

---

## 11. Como acessar `/auth/profile`

**Requisição:**

```http
GET http://localhost:3000/auth/profile
Authorization: Bearer SEU_JWT_AQUI
```

**cURL:**

```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer SEU_JWT_AQUI"
```

**Resposta (sucesso):**

```json
{
  "message": "Usuário autenticado",
  "user": {
    "id": 1,
    "email": "teste@email.com"
  }
}
```

**Sem token ou token inválido:**

```json
// HTTP 401
{
  "message": "Token de autenticação não informado."
}
```

---

## 12. Diferença entre Magic Token e JWT

| Aspecto                | Magic Token                              | JWT (da aplicação)                         |
|-------------------------|-------------------------------------------|---------------------------------------------|
| Finalidade              | Provar que o usuário clicou no link enviado ao seu email | Autenticar requisições subsequentes na API |
| Formato                 | String aleatória com hash (não é JWT)     | JWT assinado (`jsonwebtoken`)                |
| Validade                | 10 minutos                                | 1 hora                                        |
| Reutilizável?           | Não — uso único, invalidado após o login  | Sim, até expirar                             |
| Onde é armazenado       | No "banco" em memória, junto ao usuário   | Apenas no cliente (não é salvo no servidor)  |
| Enviado onde            | No link, via query string (`?token=`)     | No header `Authorization: Bearer`            |

Essa separação é importante: mesmo que alguém interceptasse o link de login (Magic Token) depois de já usado, ele não teria mais validade nem serviria para acessar a API — quem acessa a API é sempre o JWT.

---

## 13. Estrutura de arquivos

```text
express-magic-link/
├── src/
│   ├── controllers/
│   │   └── authController.js     # Camada HTTP (request/response)
│   ├── routes/
│   │   └── authRoutes.js         # Definição das rotas
│   ├── services/
│   │   └── authService.js        # Lógica de negócio (tokens, JWT)
│   ├── middlewares/
│   │   └── authMiddleware.js     # Proteção de rotas via JWT
│   ├── database/
│   │   └── users.js              # "Banco" em memória
│   ├── config/
│   │   └── mailer.js             # Envio de email / fallback console
│   └── app.js                    # Ponto de entrada da aplicação
├── .env                          # Variáveis de ambiente (não versionar)
├── .env.example                  # Modelo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 14. Roteiro sugerido para demonstração em vídeo

1. **Suba o servidor:** `npm run dev`
2. **Solicite o link:**
   ```bash
   curl -X POST http://localhost:3000/auth/request-link \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@email.com"}'
   ```
3. **Mostre o terminal** exibindo o Magic Link gerado.
4. **Abra o link no navegador** (ou use `curl`) e mostre o JWT retornado.
5. **Use o JWT** para acessar a rota protegida:
   ```bash
   curl http://localhost:3000/auth/profile \
     -H "Authorization: Bearer SEU_JWT_AQUI"
   ```
6. **Mostre que a rota retorna o usuário autenticado.**
7. *(Opcional)* Tente acessar `/auth/verify` novamente com o mesmo token, mostrando que ele já foi invalidado.

---

## 15. Resumo do fluxo (em poucas palavras)

O usuário pede login com o email → o servidor cria um token temporário de uso único (Magic Token) e o envia por link → ao clicar, o servidor confirma que o token é válido e ainda não foi usado, descarta esse token, e emite um JWT → esse JWT, enviado no header `Authorization`, é o que autentica todas as chamadas seguintes até expirar em 1 hora.
