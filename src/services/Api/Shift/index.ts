import { z } from "zod";

import ApiBaseService from "@/services/Api/base";

import { ShiftCreateSchema } from "@/types";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type ShiftSchema = z.infer<typeof ShiftCreateSchema>;

class ApiShiftService extends ApiBaseService {
  constructor() {
    super();
  }

  static async updateShift({
    body,
    id,
  }: {
    body: Partial<ShiftSchema>;
    id: number | null | undefined;
  }) {
    const response = await this.put({
      endpoint: `${API_ENDPOINTS.SHIFT}/${id}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async createShift({ body }: { body: ShiftSchema }) {
    const response = await this.post({
      endpoint: `${API_ENDPOINTS.SHIFT}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async deleteShift({ id }: { id: number }) {
    const response = await this.delete({
      endpoint: `${API_ENDPOINTS.SHIFT}/${id}`,
      hasEnvUrl: false,
    });
    return response;
  }
}

export default ApiShiftService;
