import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

/**
 * Signed tokens for the admin gateway. (Session cookies are Better Auth's
 * now; this no longer decodes them.)
 */
class TokenService {
  static creatSha256Token(data: User): string {
    return jwt.sign(data, process.env.JWT_SECRET);
  }
}

export default TokenService;
