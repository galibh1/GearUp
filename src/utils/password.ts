import bcrypt from "bcryptjs";
import config from "../config/index.js";

const hashPassword = async (
  plainTextPassword: string,
): Promise<string> => {
  return bcrypt.hash(
    plainTextPassword,
    config.bcrypt_salt_rounds,
  );
};

const comparePassword = async (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(
    plainTextPassword,
    hashedPassword,
  );
};

export {
  comparePassword,
  hashPassword,
};