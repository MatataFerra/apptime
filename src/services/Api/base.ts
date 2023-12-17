import { ENV_URL } from "@/utils/constants/endpoints";

interface GET_PROPS {
  endpoint: string;
  hasEnvUrl?: boolean;
  options?: NextFetchRequestConfig;
}

interface POST_PROPS extends GET_PROPS {
  body: Record<string, unknown>;
}

interface PUT_PROPS extends POST_PROPS {}

class ApiBaseService {
  private static hasUrl(hasEnvUrl: boolean) {
    return hasEnvUrl ? ENV_URL : "";
  }

  static async get({ endpoint, hasEnvUrl = true, options }: GET_PROPS) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, { next: options });
    const data = await response.json();

    return data;
  }

  static async post({ endpoint, body, hasEnvUrl = true, options }: POST_PROPS) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      next: options,
    });

    const data = await response.json();

    return data;
  }

  static async put({ endpoint, body, hasEnvUrl = true, options }: PUT_PROPS) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      next: options,
    });

    const data = await response.json();

    return data;
  }
}

export default ApiBaseService;
