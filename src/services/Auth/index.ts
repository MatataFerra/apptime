import { UserType } from "@/types/services";
import prisma from "#/prisma/client";
import { User } from "@prisma/client";
interface AuthServiceInterface {
  user: UserType;
  get prismaUser(): Promise<User | null>;
  oauthUser(): Promise<User | null>;
}

/** Authentication service
 * - [ ] Login
 * - [ ] Logout
 * - [ ] Register
 * - [ ] Forgot Password
 * - [ ] Create an Oauth2 User
 * - [ ] Check JWT Token
 * - [ ] Refresh JWT Token
 * - [ ] Revoke JWT Token
 */
class Auth implements AuthServiceInterface {
  user: UserType;
  constructor(user: UserType) {
    this.user = user;
  }

  get prismaUser() {
    return prisma.user.findUnique({
      where: {
        email: this.user.email,
      },
    });
  }

  async login() {}

  async oauthUser() {
    const user = this.prismaUser;
    if (!user) {
      return await prisma.user.create({
        data: {
          email: this.user.email,
          name: this.user.name,
          image: this.user.image,
          type_account: "OAUTH",
        },
      });
    }

    return user;
  }
}

export default Auth;
