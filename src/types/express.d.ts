import type { Role } from "../../generated/prisma/enums";

export {};

declare global {
  namespace Express {
    interface Request {
      validatedData?: unknown;

      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}