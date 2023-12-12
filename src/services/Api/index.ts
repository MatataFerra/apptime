import { Profile, Shift, User } from "@prisma/client";

import ApiBaseService from "@/services/Api/base";

import { UserType } from "@/types";
import type { ApiResponse } from "@/types/api_response";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiService extends ApiBaseService {
  constructor() {
    super();
  }
  static async createWaitingList(email: string) {
    return this.post({
      endpoint: API_ENDPOINTS.WAITING_LIST,
      body: { email },
    });
  }

  static async register({ email, password }: { email: string; password: string }) {
    try {
      const response = await this.post({
        endpoint: API_ENDPOINTS.REGISTER,
        body: { email, password, emailVerified: null },
        hasEnvUrl: false,
      });

      return response;
    } catch (error) {
      return error;
    }
  }

  static async getUserByEmail({
    email,
    filters,
    shifts = false,
    profile = false,
    hasEnvUrl = true,
  }: {
    email?: string | null;
    filters?: keyof User | (keyof User)[];
    shifts?: boolean;
    profile?: boolean;
    hasEnvUrl?: boolean;
  }) {
    const parseFilters = Array.isArray(filters) ? filters.join(",") : "";

    const response: ApiResponse<UserType> = await this.get({
      endpoint: `${API_ENDPOINTS.USER}?email=${email}&only=${parseFilters}&shifts=${shifts}&profile=${profile}`,
      hasEnvUrl,
    });

    return response;
  }

  static async updateUser({
    user,
    hasEnvUrl = true,
  }: {
    user: Partial<User>;
    hasEnvUrl?: boolean;
  }): Promise<ApiResponse<User>> {
    const response: ApiResponse<User> = await this.put({
      endpoint: `${API_ENDPOINTS.USER}/${user.id}`,
      body: user,
      hasEnvUrl,
    });

    return response;
  }

  static async createProfile({
    profile,
    hasEnvUrl = true,
  }: {
    profile: Omit<Profile, "id">;
    hasEnvUrl?: boolean;
  }) {
    const response = await this.post({
      endpoint: API_ENDPOINTS.PROFILE,
      body: profile,
      hasEnvUrl,
    });

    return response;
  }
}

export default ApiService;
