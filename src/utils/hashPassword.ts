import bcrypt from "bcrypt";

export const hashPassword = (plainPassword: string): string => {
  const hashed = bcrypt.hashSync(plainPassword, 10);
  return hashed;
};

export const isNotSameHash = (plainPassword: string, hash: string): boolean => {
  const result = bcrypt.compareSync(plainPassword, hash);
  return !result;
};
