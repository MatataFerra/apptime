import { Shift } from "@prisma/client";

import ApiBaseService from "@/services/Api/base";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiShiftService extends ApiBaseService {
  constructor() {
    super();
  }

  static async updateShift({
    body,
    id,
  }: {
    body: Partial<Omit<Shift, "id">>;
    id: number | null | undefined;
  }) {
    const response = await this.put({
      endpoint: `${API_ENDPOINTS.SHIFT}/${id}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async createShift({ body }: { body: Omit<Shift, "id"> }) {
    const response = await this.post({
      endpoint: `${API_ENDPOINTS.SHIFT}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }
}

export default ApiShiftService;
