
/**
 * {
 *   id: number,
 *   email: string,
 *   magicToken: string | null,
 *   magicTokenExpiresAt: number | null
 * }
 */
export const users = [];

let nextId = 1;


export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}


export function findUserById(id) {
  return users.find((user) => user.id === id);
}


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


export function findOrCreateUser(email) {
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return existingUser;
  }

  return createUser(email);
}
