function generateToken(length: number = 10): string {
  const symbols =
    'qwertyuiopasdfghjklzxcvbnm123456789QWERTYUIOPASDFGHJKLZXCVBNM';

  let token = '';
  for (let i = 0; i < length; i++)
    token += symbols[Math.floor(Math.random() * symbols.length)];

  return token;
}
export default { generateToken };