import client from "./client";
import type { Token, User } from "../types/api";

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    client.post<User>("/auth/register", data).then((r) => r.data),

  login: (data: { username: string; password: string }) => {
    // Backend expects OAuth2 form data for login
    const form = new URLSearchParams();
    form.append("username", data.username);
    form.append("password", data.password);
    return client
      .post<Token>("/auth/login", form.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((r) => r.data);
  },

  me: () => client.get<User>("/auth/me").then((r) => r.data),
};
