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
}

export default Database;
