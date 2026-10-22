import ApiBase from "@/services/Api/Base";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

/** Shift routes the client still calls; creating and editing go through server actions. */
class ApiShift extends ApiBase {
  constructor() {
    super();
  }

  static async deleteHourly({ id }: { id: number }) {
    const response = await this.delete({
      endpoint: `${API_ENDPOINTS.HOURLY}/${id}`,
    });
    return response;
  }

  static async deleteProduction({ id }: { id: number }) {
    const response = await this.delete({
      endpoint: `${API_ENDPOINTS.PRODUCTION}/${id}`,
    });
    return response;
  }
}

export default ApiShift;
