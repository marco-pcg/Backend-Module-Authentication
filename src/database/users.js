// Banco de dados em memória, usado apenas para fins didáticos/demonstração.
// Os dados são perdidos toda vez que o servidor é reiniciado.

/**
 * Estrutura de cada usuário:
 * {
 *   id: number,
 *   email: string,
 *   magicToken: string | null,
 *   magicTokenExpiresAt: number | null // timestamp em milissegundos
 * }
 */
export const users = [];

let nextId = 1;

/**
 * Busca um usuário pelo email.
 * @param {string} email
 * @returns {object | undefined}
 */
export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

/**
 * Busca um usuário pelo id.
 * @param {number} id
 * @returns {object | undefined}
 */
export function findUserById(id) {
  return users.find((user) => user.id === id);
}

/**
 * Cria um novo usuário e adiciona ao array em memória.
 * @param {string} email
 * @returns {object} usuário criado
 */
export function createUser(email) {
  const newUser = {
    id: nextId++,
    email,
    magicToken: null,
    magicTokenExpiresAt: null,
  };

  users.push(newUser);
  return newUser;
}

/**
 * Busca o usuário pelo email; caso não exista, cria um novo.
 * @param {string} email
 * @returns {object} usuário encontrado ou recém-criado
 */
export function findOrCreateUser(email) {
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return existingUser;
  }

  return createUser(email);
}
