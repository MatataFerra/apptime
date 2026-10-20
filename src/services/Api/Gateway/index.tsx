import type { User } from "@prisma/client";

import ApiBase from "@/services/Api/Base";
import Password from "@/services/Auth/password";

class ApiGateway extends ApiBase {
  constructor() {
    super();
  }

  static async requestToken({
    user,
    token,
  }: {
    user: User;
    token: string;
  }): Promise<{ message: string; ok: boolean; token: string }> {
    return this.post({
      endpoint: process.env.GATEWAY_URL + "/api/v1/jwt",
      body: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
    });
  }

  static async checkToken({
    token,
  }: {
    token: string;
  }): Promise<{ message: string; ok: boolean; token: string }> {
    const password = await Password.hashPassword(process.env.GATEWAY_PASSWORD);
    return await this.get({
      endpoint: process.env.GATEWAY_URL + "/api/v1/jwt/check",
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
        "x-password": password,
      },
    });
  }
}

export default ApiGateway;
