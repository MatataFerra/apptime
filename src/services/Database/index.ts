import { User } from "@prisma/client";

import { FailureApiResponse, SuccessUserApiResponse } from "@/types/api_response";

import { API_ENDPOINTS } from "@/utils/constants/endpoints";

class Database {
  static async createWaitingList(email: string) {
    return fetch(API_ENDPOINTS.WAITING_LIST, {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  static async register({
    email,
    password,
    fullname,
  }: {
    email: string;
    password: string;
    fullname: string;
  }) {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({ email, password, name: fullname, emailVerified: null }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await response.json();
        throw message;
      }

      return await response.json();
    } catch (error) {
      return error;
    }
  }

  static async getUserByEmail({
    email,
    filters,
  }: {
    email?: string | null;
    filters?: keyof User | (keyof User)[];
  }): Promise<SuccessUserApiResponse> {
    const parseFilters = Array.isArray(filters) ? filters.join(",") : filters;

    const response = await fetch(`${API_ENDPOINTS.USER}?email=${email}&only=${parseFilters}`);
    const data: SuccessUserApiResponse = await response.json();

    return data;
  }

  static async updateUser(user: Partial<User>) {
    const response = await fetch(`${API_ENDPOINTS.USER}/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return data;
  }
}

export default Database;
