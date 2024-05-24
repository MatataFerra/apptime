import { z } from "zod";

import ApiBaseService from "@/services/Api/base";

import { HourlyCreateSchema, ProductionCreateSchema } from "@/types";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

type ProductionSchema = z.infer<typeof ProductionCreateSchema>;
type HourlySchema = z.infer<typeof HourlyCreateSchema>;
type ShiftTypes = ProductionSchema | HourlySchema;

class ApiShiftService extends ApiBaseService {
  constructor() {
    super();
  }

  static async updateHourly({
    body,
    id,
  }: {
    body: Partial<HourlySchema>;
    id: number | null | undefined;
  }) {
    const response = await this.put({
      endpoint: `${API_ENDPOINTS.SHIFT}/${id}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async updateShift({
    body,
    id,
  }: {
    body: Partial<ShiftTypes>;
    id: number | null | undefined;
  }) {
    const response = await this.put({
      endpoint: `${API_ENDPOINTS.SHIFT}/${id}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async createHourly({ body }: { body: HourlySchema }) {
    const response = await this.post({
      endpoint: `${API_ENDPOINTS.SHIFT}/hourly`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async createProduction({ body }: { body: ProductionSchema }) {
    const response = await this.post({
      endpoint: `${API_ENDPOINTS.SHIFT}`,
      body,
      hasEnvUrl: false,
    });
    return response;
  }

  static async createShift({ body }: { body: ShiftTypes }) {
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

  static async deleteHourly({ id }: { id: number }) {
    const response = await this.delete({
      endpoint: `${API_ENDPOINTS.SHIFT}/hourly/${id}`,
      hasEnvUrl: false,
    });
    return response;
  }

  static async deleteProduction({ id }: { id: number }) {
    const response = await this.delete({
      endpoint: `${API_ENDPOINTS.SHIFT}/production/${id}`,
      hasEnvUrl: false,
    });
    return response;
  }
}

export default ApiShiftService;
