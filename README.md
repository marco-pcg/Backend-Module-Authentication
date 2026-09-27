# Login Mágico (Magic Link) com Express.js

Projeto didático que demonstra autenticação sem senha com **Magic Link**, usando Node.js, Express.js e ES Modules. O fluxo mostra como solicitar um link temporário por email e validá-lo uma única vez.

O projeto funciona sem SMTP configurado: nesse caso, o link aparece no terminal do servidor.

## Como funciona

1. O usuário informa o email em `POST /auth/request-link`.
2. O servidor encontra ou cria o usuário e gera um token aleatório válido por 10 minutos.
3. O servidor envia o link por email ou o exibe no terminal.
4. Ao abrir o link, `GET /auth/verify?token=...` valida e invalida o token.
5. A resposta confirma o login e retorna os dados do usuário.

O link é o foco deste exemplo: depois de validado, o token não pode ser reutilizado. Este projeto não implementa uma sessão persistente nem autentica chamadas posteriores.

## Arquitetura

```text
Route → Controller → Service → Banco em memória (users.js)
```

- **Routes** (`src/routes/authRoutes.js`): registra os endpoints.
- **Controller** (`src/controllers/authController.js`): trata requisições e respostas HTTP.
- **Service** (`src/services/authService.js`): gera, envia, verifica e invalida Magic Tokens.
- **Database** (`src/database/users.js`): array em memória que simula usuários.
- **Mailer** (`src/config/mailer.js`): envia email com Nodemailer ou exibe o link no terminal.

## Requisitos e instalação

É necessário ter Node.js 18 ou superior.

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure:

```env
PORT=3000
MAGIC_LINK_SECRET=uma_chave_aleatoria_forte

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

APP_URL=http://localhost:3000
```

`MAGIC_LINK_SECRET` é usado no cálculo do hash do token. Em produção, use um valor aleatório e mantenha-o em segredo. `APP_URL` deve corresponder ao endereço usado para acessar a aplicação.

Para envio real de email, preencha os campos SMTP. Por exemplo:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASSWORD=sua_senha_de_app
```

Sem SMTP, o servidor imprime o link no terminal, o que permite demonstrar o fluxo localmente.

## Executar

```bash
# Desenvolvimento, com reinicialização automática
npm run dev

# Execução simples
npm start
```

O servidor fica disponível em `http://localhost:3000`.

## Solicitar um Magic Link

```bash
curl -X POST http://localhost:3000/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com"}'
```

Resposta:

```json
{
  "message": "Se o email estiver correto, um link de acesso foi enviado."
}
```

O token não é incluído nessa resposta. Sem SMTP, copie o link exibido no terminal.

## Verificar o Magic Link

Abra o link no navegador ou envie uma requisição como esta, substituindo o token:

```bash
curl "http://localhost:3000/auth/verify?token=SEU_TOKEN_AQUI"
```

Resposta de sucesso:

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "teste@email.com"
  }
}
```

O token expira após 10 minutos e só pode ser usado uma vez. Se estiver inválido ou expirado, solicite um novo link.

| Situação | HTTP | Mensagem |
| --- | ---: | --- |
| Token ausente | 400 | `Token não informado.` |
| Token inválido ou já utilizado | 400 | `Token inválido.` |
| Token expirado | 401 | `Token expirado. Solicite um novo link.` |

## Estrutura de arquivos

```text
src/
├── config/
│   └── mailer.js             # Envio de email e fallback para o terminal
├── controllers/
│   └── authController.js     # Requisição e resposta HTTP
├── database/
│   └── users.js              # Usuários em memória
├── routes/
│   └── authRoutes.js         # Endpoints do Magic Link
├── services/
│   └── authService.js        # Lógica do Magic Link
└── app.js                    # Inicialização do Express
```

## Roteiro para demonstração

1. Inicie o servidor com `npm run dev`.
2. Envie uma requisição para `POST /auth/request-link`.
3. Mostre no terminal o link gerado (ou confira a caixa de entrada).
4. Abra o link e mostre os dados do usuário retornados.
5. Tente abrir o mesmo link novamente para mostrar que o token é de uso único.

Os usuários e tokens ficam apenas na memória; os dados são apagados quando o servidor reinicia. O armazenamento persistente pode ser apresentado como uma próxima etapa da aula.
