import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from "../../../src/secrets";

export const hashAsync= async (password: string) => 
    await bcrypt.hash(password, parseInt(SALT_ROUNDS ?? '10'))

export const compareAsync = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue);

