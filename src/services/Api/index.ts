import { Profile, User } from "@prisma/client";

import api from "@/services/Api/base";

import { SuccessUserApiResponse } from "@/types/api_response";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiService {
  static async createWaitingList(email: string) {
    return api.post({
      endpoint: API_ENDPOINTS.WAITING_LIST,
      body: { email },
    });
  }

  static async register({ email, password }: { email: string; password: string }) {
    try {
      const response = await api.post({
        endpoint: API_ENDPOINTS.REGISTER,
        body: { email, password, emailVerified: null },
        hasEnvUrl: false,
      });

      return await response.json();
    } catch (error) {
      return error;
    }
  }

  static async getUserByEmail({
    email,
    filters,
    hasEnvUrl = true,
  }: {
    email?: string | null;
    filters?: keyof User | (keyof User)[];
    hasEnvUrl?: boolean;
  }): Promise<SuccessUserApiResponse> {
    const parseFilters = Array.isArray(filters) ? filters.join(",") : filters;

    const response: SuccessUserApiResponse = await api.get({
      endpoint: `${API_ENDPOINTS.USER}?email=${email}&filters=${parseFilters}`,
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
  }) {
    const response = await api.put({
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
    const response = await api.post({
      endpoint: API_ENDPOINTS.PROFILE,
      body: profile,
      hasEnvUrl,
    });

    return response;
  }
}

export default ApiService;
