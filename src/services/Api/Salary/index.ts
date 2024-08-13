import type { Contribution, Tax } from "@prisma/client";

import ApiBase from "@/services/Api/Base";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type Response = {
  response: boolean;
  message: string;
  salaryItems: { contributions: Contribution[]; taxes: Tax[] };
};

class ApiSalaryItems extends ApiBase {
  constructor() {
    super();
  }

  static async getAll(): Promise<Response> {
    return this.get({
      endpoint: API_ENDPOINTS.SALARY_ITEMS,
    });
  }
}

export default ApiSalaryItems;
