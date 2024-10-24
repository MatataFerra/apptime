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

  static async getTrack(): Promise<SuccessApiResponse<HourlyType[]>> {
    const track = await this.get({
      endpoint: `${API_ENDPOINTS.TRACK}`,
    });

    return track;
  }

  static async getLast(): Promise<SuccessApiResponse<{ last: HourlyType[] }>> {
    const track = await this.get({
      endpoint: `${API_ENDPOINTS.TRACK}/last`,
    });

    return track;
  }

  static async getEarnings(): Promise<SuccessApiResponse<{ earnings: number }>> {
    const track = await this.get({
      endpoint: `${API_ENDPOINTS.TRACK}/earns`,
    });

    return track;
  }
}

export default ApiHourly;
