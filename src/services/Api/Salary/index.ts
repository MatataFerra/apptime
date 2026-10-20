import ApiBase from "@/services/Api/Base";

import type { SalaryItems } from "@/types";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type Response = {
  response: boolean;
  message: string;
  salaryItems: SalaryItems;
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
