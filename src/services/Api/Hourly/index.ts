import ApiBase from "@/services/Api/Base";

import type { HourlyType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiHourly extends ApiBase {
  constructor() {
    super();
  }

  static async getHourlies(): Promise<SuccessApiResponse<HourlyType[]>> {
    const hourlies = await this.get({
      endpoint: `${API_ENDPOINTS.HOURLY}`,
    });

    return hourlies;
  }
}

export default ApiHourly;
