/**
 * Base de dados EM MEMÓRIA, apenas para fins didáticos.
 *
 * Em um projeto real, isso seria substituído por um banco de dados
 * (PostgreSQL, MongoDB, MySQL, etc). Aqui usamos um array simples
 * para deixar o fluxo de autenticação fácil de entender e explicar.
 *
 * Importante: como é um array em memória, os usuários são perdidos
 * toda vez que o servidor é reiniciado.
 */

const users = [];

// Contador simples para gerar IDs incrementais (1, 2, 3, ...)
let nextId = 1;

/**
 * Busca um usuário pelo googleId.
 * @param {string} googleId
 * @returns {object|undefined}
 */
function findUserByGoogleId(googleId) {
  return users.find((user) => user.googleId === googleId);
}

/**
 * Cria um novo usuário e adiciona à base em memória.
 * @param {{ googleId: string, name: string, email: string, picture: string }} data
 * @returns {object} usuário criado
 */
function createUser({ googleId, name, email, picture }) {
  const newUser = {
    id: nextId++,
    googleId,
    name,
    email,
    picture,
  };

  users.push(newUser);
  return newUser;
}

export { users, findUserByGoogleId, createUser };
