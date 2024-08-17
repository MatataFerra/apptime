import ApiBase from "@/services/Api/Base";

import type { Contributions } from "@/types";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type Response = {
  response: boolean;
  message: string;
  contribution: Contributions[];
};

class ApiContributions extends ApiBase {
  constructor() {
    super();
  }

  static async getAll(): Promise<Response> {
    return this.get({
      endpoint: API_ENDPOINTS.CONTRIBUTIONS,
    });
  }
}

export default ApiContributions;
