import ApiBase from "@/services/Api/Base";

import type { SavedEmployer } from "@/types";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type Response = {
  response: boolean;
  message: string;
  employers: SavedEmployer[];
};

class ApiEmployers extends ApiBase {
  constructor() {
    super();
  }

  static async getAll(): Promise<Response> {
    return this.get({ endpoint: API_ENDPOINTS.EMPLOYERS });
  }
}

export default ApiEmployers;
