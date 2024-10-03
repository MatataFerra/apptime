import ApiBase from "@/services/Api/Base";

import type { ProductionType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiProduction extends ApiBase {
  constructor() {
    super();
  }

  static async getProductions(): Promise<SuccessApiResponse<ProductionType[]>> {
    const productions = await this.get({
      endpoint: `${API_ENDPOINTS.PRODUCTION}`,
    });

    return productions;
  }
}

export default ApiProduction;
