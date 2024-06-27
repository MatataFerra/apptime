import ApiBase from "@/services/Api/Base";

import type { Taxes } from "@/types";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type Response = {
  response: boolean;
  message: string;
  tax: Taxes[];
};

class ApiTax extends ApiBase {
  constructor() {
    super();
  }

  static async getAll(): Promise<Response> {
    return this.get({
      endpoint: API_ENDPOINTS.TAX,
    });
  }
}

export default ApiTax;
