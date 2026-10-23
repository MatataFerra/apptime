import type { User } from "@prisma/client";

import ApiBase from "@/services/Api/Base";

import type { ApiResponse, SuccessUserApiResponse } from "@/types/api_response";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiService extends ApiBase {
  constructor() {
    super();
  }
  static async createWaitingList(email: string) {
    return this.post({
      endpoint: API_ENDPOINTS.WAITING_LIST,
      body: { email },
    });
  }

  static async getUserByEmail({
    email,
    filters,
    shifts = false,
    profile = false,
    config = false,
    hasEnvUrl,
    options,
  }: {
    email?: string | null;
    filters?: keyof User | (keyof User)[];
    shifts?: boolean;
    profile?: boolean;
    config?: boolean;
    hasEnvUrl?: boolean;
    options?: NextFetchRequestConfig;
  }) {
    const parseFilters = Array.isArray(filters) ? filters.join(",") : "";

    const buildEndpoint = ApiService.addSearchParamsToEndpoint(API_ENDPOINTS.USER, [
      { name: "email", value: email ?? "" },
      { name: "only", value: parseFilters },
      { name: "shifts", value: String(shifts) },
      { name: "profile", value: String(profile) },
      { name: "config", value: String(config) },
    ]);

    const response: SuccessUserApiResponse = await this.get({
      endpoint: buildEndpoint,
      hasEnvUrl,
      options,
    });

    return response;
  }

  static async updateUser({
    user,
    hasEnvUrl,
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

  static async delay(ms: number) {
    // eslint-disable-next-line no-console
    const response = console.log("delayed", ms);
    return new Promise((resolve) => setTimeout(() => resolve(response), ms));
  }

  private static addSearchParamsToEndpoint(
    endpoint: (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS],
    params: Array<{ name: string; value: string }>
  ) {
    const parse = params
      .map(({ name, value }) => {
        if (!value) return "";
        return `${name}=${value}`;
      })
      .filter((param) => param !== "");

    return `${endpoint}?${parse.join("&")}`;
  }
}

export default ApiService;
