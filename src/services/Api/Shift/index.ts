import { Shift } from "@prisma/client";

import ApiBaseService from "@/services/Api/base";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class ApiShiftService extends ApiBaseService {
  constructor() {
    super();
  }

  static async updateShift(body: Partial<Omit<Shift, "id">>, id: Shift["id"] | null | undefined) {
    return this.put<Shift>({
      endpoint: `${API_ENDPOINTS.SHIFT}/${id}`,
      body,
      hasEnvUrl: false,
    });
  }
}

export default ApiShiftService;
