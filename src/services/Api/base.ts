import { ENV_URL } from "@/utils/constants/endpoints";

class ApiBaseService {
  private static hasUrl(hasEnvUrl: boolean) {
    return hasEnvUrl ? ENV_URL : "";
  }

  static async get({ endpoint, hasEnvUrl = true }: { endpoint: string; hasEnvUrl?: boolean }) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`);
    const data = await response.json();

    return data;
  }

  static async post({
    endpoint,
    body,
    hasEnvUrl = true,
  }: {
    endpoint: string;
    body: Record<string, unknown>;
    hasEnvUrl?: boolean;
  }) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  }

  static async put({
    endpoint,
    body,
    hasEnvUrl = true,
  }: {
    endpoint: string;
    body: Record<string, unknown>;
    hasEnvUrl?: boolean;
  }) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return data;
  }
}

export default ApiBaseService;
