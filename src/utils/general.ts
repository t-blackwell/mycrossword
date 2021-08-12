// eslint-disable-next-line import/prefer-default-export
export function isValidChar(char: string) {
  const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return whitelist.includes(char);
}
