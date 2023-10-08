class Database {
  static async createWaitingList(email: string) {
    return fetch("/api/waiting-list", {
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
      const response = await fetch("/api/user/create", {
        method: "POST",
        body: JSON.stringify({ email, password, fullname, emailVerified: null }),
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
}

export default Database;
