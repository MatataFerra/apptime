import { ENV_URL } from "@/utils/constants/endpoints";

interface GET_PROPS {
  endpoint: string;
  hasEnvUrl?: boolean;
  headers?: HeadersInit;
  options?: NextFetchRequestConfig;
}

interface POST_PROPS extends GET_PROPS {
  body?: Record<string, unknown>;
}

interface PUT_PROPS extends POST_PROPS {}

interface DELETE_PROPS extends GET_PROPS {}

class ApiBase {
  private static hasUrl(hasEnvUrl: boolean) {
    return hasEnvUrl ? ENV_URL : "";
  }

  static async get({ endpoint, hasEnvUrl = false, options, headers }: GET_PROPS) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      next: options,
      headers,
    });
    const data = await response.json();

    return data;
  }

  static async post({
    endpoint,
    body,
    headers = { "Content-Type": "application/json" },
    hasEnvUrl = false,
    options,
  }: POST_PROPS) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
      next: options,
    });

    const data = await response.json();

    return data;
  }

  static async put({ endpoint, body, hasEnvUrl = false, options }: PUT_PROPS) {
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

  static async delete({ endpoint, hasEnvUrl = false, options }: DELETE_PROPS) {
    const response = await fetch(`${this.hasUrl(hasEnvUrl)}${endpoint}`, {
      method: "DELETE",
      next: options,
    });

    const data = await response.json();

    return data;
  }
}

export default ApiBase;
